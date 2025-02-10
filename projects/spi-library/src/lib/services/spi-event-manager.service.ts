import { Injectable } from '@angular/core';
import { SpiEventListenerService } from './spi-event-listener.service';
import { SpiPollingListenerService } from './spi-polling-listener.service';

@Injectable({
    providedIn: 'root',
})
export class SpiEventManagerService {
    private paused: number = 0;
    private eventServices: SpiEventListenerService<any>[] = [];
    private pollingServices: SpiPollingListenerService<any>[] = [];

    /**
     * Should only be called in the constructor of an EventListenerService, shouldn't be necessary in any subtypes.
     */
    public registerEventListenerService(service: SpiEventListenerService<any>) {
        if (this.paused > 0) {
            service.pause();
        } else {
            service.resume();
        }
        this.eventServices.push(service);
    }

    /**
     * Should only be called in the constructor of an EventListenerService, shouldn't be necessary in any subtypes.
     */
    public registerPollingListenerService(
        service: SpiPollingListenerService<any>
    ) {
        if (this.paused > 0) {
            service.pause();
        } else {
            service.resume();
        }
        this.pollingServices.push(service);
    }

    public async pause() {
        let a: Promise<void>[] = [],
            b: Promise<void>[] = [];
        if (this.paused === 0) {
            a = this.eventServices.map((service) => service.pause());
            b = this.pollingServices.map((service) => service.pause());
        }
        this.paused += 1;
        await Promise.all([...a, ...b]);
    }

    public resume() {
        if (this.paused > 0) this.paused -= 1;
        if (this.paused === 0) {
            this.eventServices.map((service) => service.resume());
            this.pollingServices.map((service) => service.resume());
        }
    }
}
