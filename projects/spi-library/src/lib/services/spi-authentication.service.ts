import { computed, Injectable, resource, signal } from '@angular/core';

// Ensure TSConfig points paths @spi-admin-sdk -> The AdminSdk library
import {
    APIV1,
    Logger,
    SilpubClientV1,
    FormData as SPIFormData,
} from '@spi-admin-sdk';

@Injectable({
    providedIn: 'root',
})
export abstract class SpiAuthenticationService {
    private _api = signal(APIV1.From(FetchAPI));
    private _logger = signal<Logger>(Logger.Console(Logger.EVERYTHING));
    private _endpoint = signal(localStorage.getItem('endpoint') || '');
    private _key = signal(localStorage.getItem('key') || '');
    private authResource = resource<boolean, SilpubClientV1>({
        request: () => this.client(),
        loader: async ({ request: client }) => {
            const authenticated = await client.CheckStatus();
            if (authenticated) {
                localStorage.setItem('endpoint', this._endpoint());
                localStorage.setItem('key', this._key());
            }
            return authenticated;
        },
    });

    public endpoint = this._endpoint.asReadonly();
    public key = this._key.asReadonly();
    public client = computed(
        () =>
            new SilpubClientV1(this._endpoint(), this._key(), {
                logger: this._logger(),
                api: this._api(),
            })
    );

    public readonly isAuthenticated = computed(
        () => this.authResource.value() || false
    );

    public login(endpoint: string, key: string) {
        this._endpoint.set(endpoint);
        this._key.set(key);
    }

    public logout() {
        this._endpoint.set('');
        this._key.set('');
        localStorage.setItem('endpoint', '');
        localStorage.setItem('key', '');
    }

    public setLogger(logger: Logger) {
        this._logger.set(logger);
    }

    public setAPI(api: ReturnType<(typeof APIV1)['From']>) {
        this._api.set(api);
    }
}

const getHeaders = (key: string) => ({ 'X-SPIToken-id': key });
const FetchAPI = {
    get: async (key: string, url: string) => {
        const response = await fetch(url, { headers: getHeaders(key) });
        return await response.json();
    },
    getArrayBuffer: async (key: string, url: string) => {
        const response = await fetch(url, { headers: getHeaders(key) });
        return await response.arrayBuffer();
    },
    postJSON: async (key: string, url: string, body: object) => {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getHeaders(key),
            },
            body: JSON.stringify(body),
        });
        return await response.json();
    },
    postFormData: async (key: string, url: string, formData: SPIFormData) => {
        const fd = new FormData();

        for (const entry of formData) {
            fd.append(entry[0], entry[1], entry[2]);
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: getHeaders(key),
            // @ts-ignore
            body: fd,
        });

        return await response.json();
    },
    delete: async (key: string, url: string) => {
        const response = await fetch(url, {
            method: 'DELETE',
            headers: getHeaders(key),
        });
        return await response.json();
    },
};
