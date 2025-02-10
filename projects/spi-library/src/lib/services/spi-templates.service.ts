import { effect, Injectable, signal } from '@angular/core';
import JSZip from 'jszip';

// Ensure TSConfig points paths @spi-admin-sdk -> The AdminSdk library
import { ErrorRecordV1, TemplateRecordV1 } from '@spi-admin-sdk';

// Ensure TSConfig points paths @spi-types -> The UXP-Types library
import { indesign, uxp } from '@spi-types';

import {
    SpiEventManagerService,
    SpiEventListenerService,
    SpiAuthenticationService,
} from '../../public_api';
import { SpiFileUtils } from '../../public_api';
const {
    isFolder,
    isFile,
    deleteEntry,
    extractZipToFolder,
    urlToFileName,
    zipFolderContents,
    getFiles,
    areEqual,
} = SpiFileUtils;

type File = uxp.storage.File;
type Entry = uxp.storage.Entry;
type Folder = uxp.storage.Folder;
const { formats } = uxp.storage;
const fs = uxp.storage.localFileSystem;

export type TemplateIndex = Array<{
    data: TemplateRecordV1['ALL'];
    folder: Folder;
    parent: Folder;
}>;

@Injectable({
    providedIn: 'root',
})
export class SpiTemplateService extends SpiEventListenerService<TemplateIndex> {
    private _serverFolder = signal<uxp.storage.Folder | null>(null);
    public serverFolder = this._serverFolder.asReadonly();

    protected initialState(): TemplateIndex {
        return [];
    }

    protected compareStates(
        oldState: TemplateIndex,
        newState: TemplateIndex
    ): boolean {
        if (oldState.length !== newState.length) return false;

        for (const { data } of newState) {
            if (
                !oldState.find(
                    (old) =>
                        old.data['id'] === data['id'] &&
                        old.data['name'] === data['name']
                )
            ) {
                return false;
            }
        }

        return true;
    }

    protected async collectState(): Promise<TemplateIndex> {
        if (!this.authService.isAuthenticated()) return [];

        const tempFolder = await fs.getTemporaryFolder();

        try {
            const server = urlToFileName(this.authService.endpoint());
            let folder: File | Folder;
            try {
                folder = await tempFolder.getEntry(server);
            } catch (_) {
                try {
                    folder = await tempFolder.createFolder(server);
                } catch (_) {
                    throw 'Could not create folder';
                }
            }

            if (!isFolder(folder)) throw 'Not a folder';

            if (this._serverFolder()?.nativePath !== folder.nativePath) {
                this._serverFolder.set(folder);
            }

            const entries = await folder.getEntries();
            const templates = entries.filter((entry) => isFolder(entry));

            const templateIndex: TemplateIndex = [];

            for (const folder of templates) {
                let templateDataFile: uxp.storage.File;
                try {
                    const file = await folder.getEntry('data.json');
                    if (isFile(file)) {
                        templateDataFile = file;
                    } else {
                        continue;
                    }
                } catch (e) {
                    deleteEntry(folder);
                    continue;
                }

                const templateData = await templateDataFile.read({
                    format: formats.utf8,
                });
                const data = JSON.parse(templateData);

                let templateFolder: uxp.storage.Folder;
                try {
                    const fold = await folder.getEntry('template');
                    if (isFolder(fold)) {
                        templateFolder = fold;
                    } else {
                        deleteEntry(folder);
                        continue;
                    }
                } catch (e) {
                    deleteEntry(folder);
                    continue;
                }

                templateIndex.push({
                    data,
                    folder: templateFolder,
                    parent: folder,
                });
            }

            return templateIndex;
        } catch (e) {
            console.error(e);
            return [];
        }
    }

    private interval: any;
    protected addEventListeners(updater: () => Promise<void>): void {
        this.interval = setInterval(updater, 5000);
    }
    protected removeEventListeners(_updater: () => Promise<void>): void {
        clearInterval(this.interval);
    }

    constructor(
        manager: SpiEventManagerService,
        private authService: SpiAuthenticationService
    ) {
        super(manager);

        effect(() => {
            authService.isAuthenticated();
            this.refresh();
        });
    }

    public async remove(identifier: number | string) {
        const template = this.state().find(
            (template) =>
                template.data['id'] === identifier ||
                template.data['name'] === identifier
        );

        if (!template) {
            return false;
        }

        return await deleteEntry(template.parent);
    }

    public async download(identifier: number | string) {
        const tempFolder = await fs.getTemporaryFolder();

        const server = urlToFileName(this.authService.endpoint());
        const serverFolder = await tempFolder.getEntry(server);
        if (!isFolder(serverFolder)) throw 'Server folder is not folder';

        const templateData = await this.getTemplate(identifier);
        if (templateData instanceof ErrorRecordV1) {
            return {
                msg: `Failed to get template data from the server with identifier: ${identifier}`,
                errors: [templateData],
            };
        }

        const templateDownload = await this.downloadTemplate(identifier);
        if (templateDownload instanceof ErrorRecordV1) {
            return {
                msg: `Failed to download template from the server with identifier: ${identifier}`,
                errors: [templateData],
            };
        }

        const templateId = templateData.id.toString();
        try {
            const existingFolder = await serverFolder.getEntry(templateId);

            if (isFolder(existingFolder)) {
                await this.closeAnyOpenDocuments(existingFolder);
            }

            const [success, e] = await deleteEntry(existingFolder);
            if (!success) {
                return {
                    msg: `Failed to delete the template folder for identifier: ${identifier}`,
                    errors: [e],
                };
            }
        } catch (_) {}

        let folder: uxp.storage.Folder,
            templateFolder: uxp.storage.Folder,
            templateDataFile: uxp.storage.File;
        try {
            folder = await serverFolder.createFolder(templateId);
        } catch (e) {
            return {
                msg: `Failed to create folder: "${server}/${templateId}"`,
                errors: [e],
            };
        }

        try {
            templateFolder = await folder.createFolder('template');
        } catch (e) {
            return {
                msg: `Failed to create folder: "${server}/${templateId}/template"}`,
                errors: [e],
            };
        }

        try {
            templateDataFile = await folder.createFile('data.json', {
                overwrite: true,
            });
        } catch (e) {
            return {
                msg: `Failed to create folder: "${server}/${templateId}/template"}`,
                errors: [e],
            };
        }

        templateDataFile.write(JSON.stringify(templateData.ALL), {
            append: false,
            format: formats.utf8,
        });

        const zip = await JSZip.loadAsync(templateDownload, {
            createFolders: true,
        });
        await extractZipToFolder(zip, templateFolder);

        this.refresh();
        return {
            folder: templateFolder,
            data: templateData.ALL,
            parent: folder,
        };
    }

    private async updateAsRevision(identifier: number | string) {}

    public async updateAsNew(
        identifier: number | string,
        metadataVariableName = 'FontUpdaterMetadata',
        archiveName = (record: TemplateRecordV1, date: Date) => {
            const month = date.getMonth().toString().padStart(2, '0');
            const day = date.getDay().toString().padStart(2, '0');
            const year = date.getFullYear().toString();
            return `${record.id}_${month}-${day}-${year}.zip`;
        }
    ) {
        const client = this.authService.client();
        const id = this.getIdentifier(identifier);
        const original = await this.getTemplate(identifier);
        if (original instanceof ErrorRecordV1) {
            return {
                msg: `Could not get template by identifier: ${identifier}`,
                errors: [original],
            };
        }

        const template = this.state().find(
            (template) => template.data['id'] === original.id
        );
        if (template === undefined) {
            return {
                msg: `Template not downloaded by identifier: ${identifier}`,
                errors: [],
            };
        }

        await this.closeAnyOpenDocuments(template.folder);

        const time = new Date();
        // [X] 1. unname original template
        const updatedOriginalTemplate = await client.UpdateTemplate({
            ...id,
            newName: `${original['name']} (Deleted: ${time.toISOString()})`,
        });

        if (updatedOriginalTemplate instanceof ErrorRecordV1) {
            return {
                msg: `Failed to rename original template by identifier: ${identifier}`,
                errors: [],
            };
        }

        // [X] 2. Add a variable to the original template indicating it was deleted
        const deleteVariable = await client.CreateVariable({
            model: 'Template',
            modelId: template.data['id'],
            name: metadataVariableName,
            value: JSON.stringify({ deleted: time.getTime() }),
        });

        if (deleteVariable instanceof ErrorRecordV1) {
            await client.UpdateTemplate({
                ...id,
                newName: original['name'],
            });
            return {
                msg: `Failed to add deleted variable to the original template by identifier ${template.data['id']}`,
                errors: [deleteVariable],
            };
        }

        // [X] 3. zip and upload the folder
        try {
            const folder = template.folder;
            const zip = await zipFolderContents(folder);
            const ab = await zip.generateAsync({
                type: 'arraybuffer',
            });

            const newtemp = await client.CreateTemplate({
                name: original.name,
                file: ab,
                fileName: archiveName(original, time),
            });

            if (newtemp instanceof ErrorRecordV1) {
                await client.UpdateTemplate({
                    ...id,
                    newName: original['name'],
                });

                await client.DeleteVariable({
                    id: deleteVariable['id'],
                });
                return {
                    msg: `Failed to create new template`,
                    errors: [newtemp],
                };
            }

            // [X] 4. add variable to the template
            const result = await client.CreateVariable({
                model: 'Template',
                modelId: newtemp.id,
                name: metadataVariableName,
                value: JSON.stringify({
                    lastUpdated: time.getTime(),
                }),
            });

            if (result instanceof ErrorRecordV1) {
                await client.DeleteTemplate({ id: newtemp['id'] });
                await client.UpdateTemplate({
                    ...id,
                    newName: original['name'],
                });

                await client.DeleteVariable({
                    id: deleteVariable['id'],
                });
                return {
                    msg: `Failed to assign variable to new template`,
                    errors: [result],
                };
            }

            const [success, e] = await deleteEntry(template.parent);
            if (!success) {
                return {
                    msg: `Failed to delete original entry. It is likely a file was open in another application.`,
                    errors: [e],
                };
            }

            this.refresh();
            return { success: true };
        } catch (e) {
            return {
                msg: `Some other error occured`,
                errors: [e],
            };
        }
    }

    private getIdentifier(identifier: number | string) {
        return typeof identifier === 'number'
            ? { id: identifier }
            : { name: identifier };
    }

    private async downloadTemplate(identifier: number | string, retries = 3) {
        const templateIdentifier = this.getIdentifier(identifier);
        let template: ErrorRecordV1 | ArrayBuffer;
        do {
            template = await this.authService
                .client()
                .DownloadTemplate(templateIdentifier);
        } while (template instanceof ErrorRecordV1 && retries-- > 0);
        return template;
    }

    private async getTemplate(identifier: number | string, retries = 3) {
        const templateIdentifier = this.getIdentifier(identifier);
        let template: ErrorRecordV1 | TemplateRecordV1;
        do {
            template = await this.authService
                .client()
                .GetTemplate(templateIdentifier);
        } while (template instanceof ErrorRecordV1 && retries-- > 0);
        return template;
    }

    private async closeAnyOpenDocuments(folder: uxp.storage.Folder) {
        const documentFiles = await getFiles(folder, 'indd');
        const templateFiles = await getFiles(folder, 'indt');
        const allFiles = [...documentFiles, ...templateFiles];

        const appDocuments = indesign.app.documents.everyItem().getElements();
        const savedAppDocuments = appDocuments.filter((doc) => doc.saved);

        for (const doc of savedAppDocuments) {
            const file = await doc.fullName;

            for (const documentFile of allFiles) {
                if (areEqual(file, documentFile)) {
                    doc.close(indesign.SaveOptions.NO);
                }
            }
        }
    }
}
