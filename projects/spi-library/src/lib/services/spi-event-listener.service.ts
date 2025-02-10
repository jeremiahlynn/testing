import { Injectable, signal, WritableSignal } from '@angular/core';
import { SpiEventManagerService } from './spi-event-manager.service';

@Injectable({
    providedIn: 'root',
})
export abstract class SpiEventListenerService<T> {
    private _state: WritableSignal<T> = signal(this.initialState());

    constructor(manager: SpiEventManagerService) {
        setTimeout(() => manager.registerEventListenerService(this), 0);
    }

    private paused: boolean = true;

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

    /**
     * Adds the necessary event listeners
     * @param updater The handler
     */
    protected abstract addEventListeners(updater: () => Promise<void>): void;

    /**
     * Removes the necessary event listeners
     * @param updater The handler
     */
    protected abstract removeEventListeners(updater: () => Promise<void>): void;

    public async pause() {
        if (!this.paused) {
            this.paused = true;
            this.removeEventListeners(this.onStateChange);
        }

        await this.processing;
    }

    public resume() {
        if (this.paused) {
            this.paused = false;
            this.addEventListeners(this.onStateChange);
            this.onStateChange();
        }
    }

    public async refresh() {
        if (!this.paused) {
            await this.onStateChange();
        }
    }

    public state = this._state.asReadonly();

    private queue: (() => void)[] = [];

    private onStateChange = async () => {
        this.queue.push(this.runComparison);
        await this.processQueue();
    };

    private runComparison = async () => {
        const newState = await this.collectState();
        const stale = await this.compareStates(this._state(), newState);

        if (!stale) {
            this._state.set(newState);
        }
    };

    private processing: Promise<void> = Promise.resolve();
    private processQueue = async () => {
        await this.processing;

        let resolver!: () => void;
        this.processing = new Promise<void>((resolve) => {
            resolver = () => {
                resolve();
            };
        });

        while (this.queue.length > 0) {
            const callback = this.queue.shift()!;
            await callback();
        }

        resolver();
    };
}
