import { Injectable, signal, WritableSignal } from '@angular/core';

type Toast = {
    id: number;
    type: 'success' | 'info' | 'error' | 'warning';
    message: Array<text | link | copy | custom>;
    time: number;
} & ToastOptions;

interface ToastOptions {
    duration: number;
}

type text = { text: string };
type link = { to: string; text: string };
type copy = { copy: string; text: string };
type custom = { custom: string; text: string };
type message =
    | string
    | link
    | copy
    | custom
    | Array<string | link | copy | { custom: string; text?: string }>;

@Injectable({
    providedIn: 'root',
})
export class SpiToasterService {
    constructor() {
        const updatePeriod = 0.05;

        setInterval(() => {
            this.toastList.update((toasts) =>
                toasts
                    .map((message) => ({
                        ...message,
                        time: message.time + updatePeriod,
                    }))
                    .filter(
                        (message) =>
                            message.duration < 0 ||
                            message.time < message.duration
                    )
            );
        }, updatePeriod * 1000);
    }

    private toastList: WritableSignal<Toast[]> = signal([]);

    private parseMessage(msg: message): Array<text | link | copy | custom> {
        if (!Array.isArray(msg)) {
            msg = [msg];
        }

        return msg.map((m) => {
            if (typeof m === 'string') {
                return { text: m } as text;
            }

            if ('custom' in m) {
                if (typeof m.text !== 'string') {
                    return { custom: m.custom, text: '' };
                } else {
                    return { custom: m.custom, text: m.text };
                }
            }

            return m;
        });
    }

    public success(msg: message, options: ToastOptions = { duration: -1 }) {
        this.toastList.update((toasts) => [
            ...toasts,
            {
                id: Math.random(),
                type: 'success',
                time: 0,
                message: this.parseMessage(msg),
                ...options,
            },
        ]);
    }

    public info(msg: message, options: ToastOptions = { duration: -1 }) {
        this.toastList.update((toasts) => [
            ...toasts,
            {
                id: Math.random(),
                type: 'info',
                time: 0,
                message: this.parseMessage(msg),
                ...options,
            },
        ]);
    }

    public warning(msg: message, options: ToastOptions = { duration: -1 }) {
        this.toastList.update((toasts) => [
            ...toasts,
            {
                id: Math.random(),
                type: 'warning',
                time: 0,
                message: this.parseMessage(msg),
                ...options,
            },
        ]);
    }

    public error(msg: message, options: ToastOptions = { duration: -1 }) {
        this.toastList.update((toasts) => [
            ...toasts,
            {
                id: Math.random(),
                type: 'error',
                time: 0,
                message: this.parseMessage(msg),
                ...options,
            },
        ]);
    }

    public remove(id: number) {
        this.toastList.update((toasts) =>
            toasts.filter((toast) => toast.id != id)
        );
    }

    public toasts = this.toastList.asReadonly();
}
