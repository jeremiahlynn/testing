import { effect, Injectable, signal } from '@angular/core';
import {
    SpiAuthenticationService,
    SpiEventListenerService,
    SpiEventManagerService,
    SpiFileLockService,
    SpiFileUtils,
    SpiInDesignUtils,
} from '../../public_api';

// Ensure TSConfig points paths @spi-admin-sdk -> The AdminSdk library
import { ErrorRecordV1, TemplateRecordV1 } from '@spi-admin-sdk';

// Ensure TSConfig points paths @spi-types -> The Spi Types library
import { indesign, uxp } from '@spi-types';
import JSZip from 'jszip';
type Folder = uxp.storage.Folder;
const fs = uxp.storage.localFileSystem;

export type LocalTemplates = Array<{
    record: { id: number; name: string };
    folder: Folder;
    parent: Folder;
}>;

@Injectable({
    providedIn: 'root',
})
export class SpiLocalTemplateService extends SpiEventListenerService<LocalTemplates> {
    protected override initialState(): LocalTemplates {
        return [];
    }
    protected override async collectState(): Promise<LocalTemplates> {
        if (!this.auth.isAuthenticated()) return [];

        const tempFolder = await fs.getTemporaryFolder();
        const serverPath = SpiFileUtils.urlToFileName(this.auth.endpoint());
        const [gotServerFolder, serverFolder] = await SpiFileUtils.getFolder(
            tempFolder,
            serverPath,
            true
        );
        if (!gotServerFolder) return [];

        const unlock = await this.lock.acquire(serverFolder);

        if (this._serverFolder()?.nativePath !== serverFolder.nativePath) {
            this._serverFolder.set(serverFolder);
        }

        const entries = await serverFolder.getEntries();
        const templates = entries.filter((entry) =>
            SpiFileUtils.isFolder(entry)
        );

        const templateIndex: LocalTemplates = [];

        for (const folder of templates) {
            const [gotDataFile, dataFile] = await SpiFileUtils.getFile(
                folder,
                'data.json'
            );
            if (!gotDataFile) {
                await SpiFileUtils.deleteEntry(folder);
                continue;
            }

            const record = await SpiFileUtils.readJSONFile(dataFile);

            const [gotTemplateFolder, templateFolder] =
                await SpiFileUtils.getFolder(folder, 'template');
            if (!gotTemplateFolder) {
                await SpiFileUtils.deleteEntry(folder);
                continue;
            }

            templateIndex.push({
                folder: templateFolder,
                parent: folder,
                record,
            });
        }

        unlock();
        return templateIndex;
    }

    protected override compareStates(
        oldState: LocalTemplates,
        newState: LocalTemplates
    ): boolean | Promise<boolean> {
        if (oldState.length !== newState.length) return false;
        for (const { record } of newState) {
            if (
                !oldState.find(
                    (old) =>
                        old.record.id === record.id &&
                        old.record.name === record.name
                )
            ) {
                return false;
            }
        }

        return true;
    }

    private interval: any;
    protected override addEventListeners(updater: () => Promise<void>): void {
        updater();
        this.interval = setInterval(updater, 5000);
    }
    protected override removeEventListeners(): void {
        clearInterval(this.interval);
    }

    constructor(
        manager: SpiEventManagerService,
        private auth: SpiAuthenticationService,
        private lock: SpiFileLockService
    ) {
        super(manager);
        effect(() => {
            if (auth.isAuthenticated()) {
                this.refresh();
            }
        });
    }

    private _serverFolder = signal<Folder | null>(null);

    public async delete(id: number) {
        if (!this.auth.isAuthenticated()) {
            return [false, 'Not authenticated'] as [false, string];
        }

        const serverFolder = this._serverFolder();

        if (!serverFolder) {
            return [false, 'Could not get server folder'] as [false, string];
        }

        const unlock = await this.lock.acquire(serverFolder);
        const [gotFolder, folder] = await SpiFileUtils.getFolder(
            serverFolder,
            id.toString()
        );

        try {
            if (!gotFolder) {
                return [
                    false,
                    `Failed to get folder: "${serverFolder.nativePath}/${id}`,
                ] as [false, string];
            }

            await this.closeAnyOpenDocuments(folder);
            const [deletedFolder] = await SpiFileUtils.deleteEntry(folder);

            if (!deletedFolder) {
                return [
                    false,
                    `Failed to delete folder: "${serverFolder.nativePath}/${id}`,
                ] as [false, string];
            }

            return [true] as [true];
        } finally {
            unlock();
            await this.refresh();
        }
    }

    public async download(id: number) {
        if (!this.auth.isAuthenticated()) {
            return [false, 'Not authenticated'] as [false, string];
        }

        const serverFolder = this._serverFolder();

        if (!serverFolder) {
            return [false, 'Could not get server folder'] as [false, string];
        }

        const unlock = await this.lock.acquire(serverFolder);

        try {
            const templateData = await this.getTemplateFromServer(id);
            if (templateData instanceof ErrorRecordV1) {
                return [false, `No template by id ${id} is on the server`] as [
                    false,
                    string,
                ];
            }

            const templateDownload = await this.downloadTemplateFromServer(id);
            if (templateDownload instanceof ErrorRecordV1) {
                return [false, `Couldn't download template by id ${id}`] as [
                    false,
                    string,
                ];
            }

            const templateId = templateData.id.toString();

            const [gotOldTemplateFolder, oldTemplateFile] =
                await SpiFileUtils.getFolder(serverFolder, templateId);
            if (gotOldTemplateFolder) {
                await this.closeAnyOpenDocuments(oldTemplateFile);
                const [deleted] =
                    await SpiFileUtils.deleteEntry(oldTemplateFile);
                if (!deleted) {
                    return [
                        false,
                        `Failed to delete folder: "${serverFolder.nativePath}/${templateId}`,
                    ] as [false, string];
                }
            }

            const [createdFolder, folder] = await SpiFileUtils.createFolder(
                serverFolder,
                templateId
            );
            if (!createdFolder) {
                return [
                    false,
                    `Failed to create folder: "${serverFolder.nativePath}/${templateId}`,
                ] as [false, string];
            }

            const [createdTemplateFolder, templateFolder] =
                await SpiFileUtils.createFolder(folder, 'template');
            if (!createdTemplateFolder) {
                return [
                    false,
                    `Failed to create folder: "${serverFolder.nativePath}/${templateId}/template"}`,
                ] as [false, string];
            }

            const [createdDataFile, dataFile] = await SpiFileUtils.createFile(
                folder,
                'data.json'
            );
            if (!createdDataFile) {
                return [
                    false,
                    `Failed to create file: "${serverFolder.nativePath}/${templateId}/data.json"}`,
                ] as [false, string];
            }

            const record = { id: templateData.id, name: templateData.name };

            SpiFileUtils.writeJSONFile(dataFile, record);

            const zip = await JSZip.loadAsync(templateDownload, {
                createFolders: true,
            });

            await SpiFileUtils.extractZipToFolder(zip, templateFolder);

            return [true, record] as [true, LocalTemplates[number]['record']];
        } finally {
            unlock();
            await this.refresh();
        }
    }

    public async isDownloaded(id: number) {
        return Boolean(this.state().find((x) => x.record.id === id));
    }

    public async open(id: number, types = ['indd', 'indt']) {
        const templates = this.state();
        const template = templates.find((x) => x.record.id === id);
        if (!template)
            return [
                false,
                'Failed to find the template, was it ever downloaded?',
            ] as [false, string];

        const allFiles = [];
        for (const type of types) {
            const files = await SpiFileUtils.getFiles(template.folder, type);
            allFiles.push(...files);
        }

        const settings = SpiInDesignUtils.setSettings();

        const documents = [];
        for (const file of allFiles) {
            try {
                documents.push(
                    indesign.app.open(
                        file,
                        true,
                        indesign.OpenOptions.OPEN_ORIGINAL
                    )
                );
            } catch (e: any) {
                return [
                    false,
                    'Failed to open the document, was it created in a newer version?',
                ] as [false, string];
            }
        }

        SpiInDesignUtils.restoreSettings(settings);
        return [true, documents] as [true, indesign.Document[]];
    }

    public async isOpen(id: number) {
        const templates = this.state();
        const template = templates.find((x) => x.record.id === id);
        if (!template) return false;

        const documents = await this.getAnyOpenDocuments(template.folder);
        return documents.length > 0;
    }

    private async closeAnyOpenDocuments(folder: Folder) {
        const documents = await this.getAnyOpenDocuments(folder);
        for (const doc of documents) {
            doc.close(indesign.SaveOptions.NO);
        }
    }

    private async getAnyOpenDocuments(folder: Folder) {
        const documentFiles = await SpiFileUtils.getFiles(folder, 'indd');
        const templateFiles = await SpiFileUtils.getFiles(folder, 'indt');
        const allFiles = [...documentFiles, ...templateFiles];

        const appDocuments = indesign.app.documents.everyItem().getElements();
        const savedAppDocuments = appDocuments.filter((doc) => doc.saved);

        const openDocuments = [];
        for (const doc of savedAppDocuments) {
            const file = await doc.fullName;

            for (const documentFile of allFiles) {
                if (SpiFileUtils.areEqual(file, documentFile)) {
                    openDocuments.push(doc);
                }
            }
        }
        return openDocuments;
    }

    private async downloadTemplateFromServer(id: number, retries = 3) {
        let template: ErrorRecordV1 | ArrayBuffer;
        do {
            template = await this.auth.client().DownloadTemplate({ id });
        } while (template instanceof ErrorRecordV1 && retries-- > 0);
        return template;
    }

    private async getTemplateFromServer(id: number, retries = 3) {
        let template: ErrorRecordV1 | TemplateRecordV1;
        do {
            template = await this.auth.client().GetTemplate({ id });
        } while (template instanceof ErrorRecordV1 && retries-- > 0);
        return template;
    }
}
