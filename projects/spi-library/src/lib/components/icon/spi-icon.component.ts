import { Component, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { SpiFileUtils } from '../../../public_api';

// Ensure TSConfig points paths @spi-types -> The UXP-Types library
import { uxp } from '@spi-types';

const fs = uxp.storage.localFileSystem;
const { isFile } = SpiFileUtils;

const svg = `<svg/>`;

@Component({
    standalone: true,
    selector: 'spi-icon',
    template: `<div [innerHTML]="svgContent"></div>`,
    styleUrls: ['./spi-icon.component.scss'],
})
export class SpiIconComponent implements OnInit, OnDestroy {
    @Input({ required: true }) public set src(val: string) {
        this.updateSourcePath(val);
    }

    public svgContent: SafeHtml;
    private unsizedHtml: string = '';

    private width: number = 0;
    private height: number = 0;

    constructor(
        private sanitizer: DomSanitizer,
        private element: ElementRef
    ) {
        this.svgContent = this.sanitizer.bypassSecurityTrustHtml(svg);
    }

    private updater: any;
    ngOnInit() {
        this.updater = setInterval(this.reconcileSizeChanges, 250);
    }

    ngOnDestroy() {
        clearInterval(this.updater);
    }

    private async updateSourcePath(source: string) {
        const pluginFolder = await fs.getPluginFolder();
        const icon = await pluginFolder.getEntry(`icons/${source}.svg`);
        if (!isFile(icon)) return;

        const contents = await icon.read({
            format: uxp.storage.formats.utf8,
        });

        this.unsizedHtml = contents;
        this.synchronizeHtml();
    }

    private async synchronizeHtml() {
        if (this.width === 0 || this.height === 0 || this.unsizedHtml === '') {
            return;
        }

        const sizedHtml = this.unsizedHtml
            .replaceAll('$width', this.width.toString())
            .replaceAll('$height', this.height.toString());

        this.svgContent = this.sanitizer.bypassSecurityTrustHtml(sizedHtml);
    }

    private reconcileSizeChanges = async () => {
        const newHeight = this.element.nativeElement.clientHeight;
        const newWidth = this.element.nativeElement.clientWidth;

        if (newHeight !== this.height || newWidth !== this.width) {
            this.width = newWidth;
            this.height = newHeight;
            this.synchronizeHtml();
        }
    };
}
