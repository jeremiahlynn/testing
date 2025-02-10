import { Injectable } from '@angular/core';
import { uxp } from '@spi-types';
import { SpiFileUtils } from '../../public_api';

type Entry = uxp.storage.Entry;

@Injectable({
    providedIn: 'root',
})
export class SpiFileLockService {
    private fileLocks: Map<string, Promise<void>> = new Map();

    private getPath(entry: Entry) {
        return SpiFileUtils.santizeNativePath(entry.nativePath);
    }

    async acquire(entry: Entry): Promise<() => void> {
        const path = this.getPath(entry);

        while (this.fileLocks.has(path)) {
            await this.fileLocks.get(path);
        }

        let resolver!: () => void;
        this.fileLocks.set(
            path,
            new Promise<void>((resolve) => {
                resolver = () => {
                    resolve();
                    this.fileLocks.delete(path);
                };
            })
        );

        return resolver;
    }
}
