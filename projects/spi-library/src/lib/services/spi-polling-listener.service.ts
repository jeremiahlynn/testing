import { Injectable, signal, WritableSignal } from '@angular/core';
import { SpiEventManagerService } from './spi-event-manager.service';

@Injectable({
    providedIn: 'root',
})
export abstract class SpiPollingListenerService<T> {
    private _state: WritableSignal<T> = signal(this.initialState());

    constructor(manager: SpiEventManagerService) {
        setTimeout(() => manager.registerPollingListenerService(this), 0);
    }

    private paused: boolean = true;

    /**
     * The amount, in milliseconds, between polls.
     */
    protected abstract delay(): number;

    /**
     * Gets the initial state
     */
    protected abstract initialState(): T;

    /**
     * Gets the state
     */
    protected abstract collectState(): T | Promise<T>;

    /**
     * Should return true if they are considered the same, false otherwise (i.e. true will NOT trigger state update)
     * @param oldState The previously stored state
     * @param newState The newly colelcted state
     */
    protected abstract compareStates(
        oldState: T,
        newState: T
    ): boolean | Promise<boolean>;

    private _timeout: any = -1;

    public async pause() {
        if (!this.paused) {
            this.paused = true;
            clearTimeout(this._timeout);
        }

        await this.processing;
    }

    public resume() {
        if (this.paused) {
            this.paused = false;
            this.updateState();
        }
    }

    public async refresh() {
        if (!this.paused) {
            clearTimeout(this._timeout);
            await this.updateState();
        }
    }

    public state = this._state.asReadonly();

    private updateId = 0;
    private processing: Promise<void> = Promise.resolve();
    private updateState = async () => {
        let resolver!: () => void;
        this.processing = new Promise<void>((resolve) => {
            resolver = () => {
                resolve();
            };
        });

        this.updateId += 1;
        const id = this.updateId;

        const newState = await this.collectState();
        const stale = await this.compareStates(this._state(), newState);

        if (!stale) {
            this._state.set(newState);
        }

        if (!this.paused && id === this.updateId) {
            this._timeout = setTimeout(this.updateState, this.delay());
        }

        resolver();
    };
}
