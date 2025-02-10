import { Injectable, signal } from '@angular/core';
import { uxp } from '@spi-types';

const fs = uxp.storage.localFileSystem;
type File = uxp.storage.File;
const { utf8, binary } = uxp.storage.formats;
const { userDesktop } = uxp.storage.domains;

@Injectable({
    providedIn: 'root',
})
export class SpiLoggerService {
    private backlog: string[] = [];
    private logFile = signal<null | File>(null);

    private async initLogFile() {
        try {
            const pluginFolder = await fs.getTemporaryFolder();
            const logFile = await pluginFolder.createFile('app.log', {
                overwrite: true,
            });

            await logFile.write(
                `Initialized log file: ${new Date().toDateString()}\n`,
                {
                    format: utf8,
                }
            );

            this.logFile.set(logFile);
        } catch (_) {}
    }

    private writeToLog(text: string) {
        this.backlog.push(text);
        const log = this.logFile();
        if (log) {
            do {
                const item = this.backlog.pop()!;
                log.write(item, {
                    format: utf8,
                    append: true,
                });
            } while (this.backlog.length > 0);
        }
    }

    constructor() {
        this.initLogFile();
    }

    /**
     * Copies the plugin's log file
     * @param name Include ".log" at the end
     */
    public async copyLog(name = 'app.log') {
        const file = await fs.getFileForSaving(name, {
            initialDomain: userDesktop,
        });

        if (file) {
            while (this.logFile() === null) {
                await new Promise((res) => setTimeout(res, 250));
            }

            const contents = await this.logFile()!.read({
                format: binary,
            });
            await file.write(contents, {
                format: binary,
            });
        }
    }

    public log(...data: any[]) {
        this.writeToLog('LOG: ' + data.toString() + '\n');
        console.log(...data);
    }

    public error(...data: any[]) {
        this.writeToLog('ERROR: ' + data.toString() + '\n');
        console.error(...data);
    }

    public warn(...data: any[]) {
        this.writeToLog('WARNING: ' + data.toString() + '\n');
        console.warn(...data);
    }
}
