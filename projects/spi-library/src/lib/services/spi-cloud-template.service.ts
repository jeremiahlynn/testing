import { computed, Injectable, resource } from '@angular/core';
import { SpiAuthenticationService, SpiFileUtils } from '../../public_api';

// Ensure TSConfig points paths @spi-admin-sdk -> The AdminSdk library
import { ErrorRecordV1, TemplateRecordV1 } from '@spi-admin-sdk';
import { uxp } from '@spi-types';

type Folder = uxp.storage.Folder;
type Identifier = { id: number } | { name: string };

@Injectable({
    providedIn: 'root',
})
export class SpiCloudTemplateService {
    constructor(private auth: SpiAuthenticationService) {}

    private templatesResource = resource({
        request: () => ({
            client: this.auth.client(),
        }),
        loader: async ({ request: { client } }) => {
            const templates = await client.ListTemplates({
                limit: 1000,
            });
            if (templates instanceof ErrorRecordV1) {
                return [];
            }
            return templates;
        },
    });

    public areLoading = this.templatesResource.isLoading;
    public list = computed(() => this.templatesResource.value() || []);
    public reload() {
        this.templatesResource.reload();
    }

    public async update(identifier: Identifier, folder: Folder) {
        const template = await this.getTemplateFromServer(identifier);
        if (template instanceof ErrorRecordV1) {
            return [false, `Template: ${identifier} does not exist`] as [
                false,
                string,
            ];
        }

        const result = await this.updateTemplateOnServer(template.name, folder);
        if (result instanceof ErrorRecordV1) {
            return [false, result.error] as [false, string];
        }

        this.reload();
        return [true] as [true];
    }

    public async create(name: string, folder: Folder) {
        const result = await this.createTemplateOnServer(name, folder);
        if (result instanceof ErrorRecordV1) {
            return [false, result.error] as [false, string];
        }

        this.reload();
        return [true] as [true];
    }

    public async delete(identifier: Identifier) {
        const result = await this.deleteTemplateOnServer(identifier);
        if (result) {
            return [false, result.error] as [false, string];
        }

        this.reload();
        return [true] as [true];
    }

    public async exists(identifier: Identifier) {
        const result = await this.auth.client().GetTemplate(identifier);
        if (result instanceof ErrorRecordV1) {
            return false;
        }

        return true;
    }

    private async getTemplateFromServer(identifier: Identifier, retries = 3) {
        let template: ErrorRecordV1 | TemplateRecordV1;
        do {
            template = await this.auth.client().GetTemplate(identifier);
        } while (template instanceof ErrorRecordV1 && retries-- > 0);
        return template;
    }

    private async deleteTemplateOnServer(identifier: Identifier, retries = 3) {
        let result: ErrorRecordV1 | null;
        do {
            result = await this.auth.client().DeleteTemplate(identifier);
        } while (result instanceof ErrorRecordV1 && retries-- > 0);
        return result;
    }

    private async createTemplateOnServer(
        name: string,
        folder: Folder,
        retries = 3
    ) {
        const zip = await SpiFileUtils.zipFolderContents(folder);
        const file = await zip.generateAsync({
            type: 'arraybuffer',
        });
        const fileName = `${folder.name}.zip`;

        let template: ErrorRecordV1 | TemplateRecordV1;
        do {
            template = await this.auth.client().CreateTemplate({
                fileName,
                file,
                name,
            });
        } while (template instanceof ErrorRecordV1 && retries-- > 0);
        return template;
    }

    private async updateTemplateOnServer(
        name: string,
        folder: Folder,
        retries = 3
    ) {
        const zip = await SpiFileUtils.zipFolderContents(folder);
        const file = await zip.generateAsync({
            type: 'arraybuffer',
        });
        const fileName = `${folder.name}.zip`;

        let template: ErrorRecordV1 | TemplateRecordV1;
        do {
            template = await this.auth.client().UpdateTemplate({
                name,
                newFile: {
                    file,
                    fileName,
                },
            });
        } while (template instanceof ErrorRecordV1 && retries-- > 0);
        return template;
    }
}
