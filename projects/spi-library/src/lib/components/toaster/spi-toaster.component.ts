import { Component, ContentChild, Input, TemplateRef } from '@angular/core';

import { SpiToasterService } from '../../services/spi-toaster.service';
import { SpiTextComponent } from '../text/spi-text.component';
import { SpiNavigatorService } from '../../services/spi-navigator.service';
import { NgTemplateOutlet } from '@angular/common';

/**
 * @selector `<spi-toaster>`
 * @input `position`
 * @cssvar `--info-[link|color|background|meter]` - used to overwrite the toaster's info colors
 * @cssvar `--warning-[link|color|background|meter]` - used to overwrite the toaster's warning colors
 * @cssvar `--error-[link|color|background|meter]` - used to overwrite the toaster's error colors
 */
@Component({
    standalone: true,
    selector: 'spi-toaster',
    templateUrl: './spi-toaster.component.html',
    styleUrl: './spi-toaster.component.scss',
    imports: [SpiTextComponent, NgTemplateOutlet],
})
export class SpiToasterComponent {
    @ContentChild(TemplateRef) customToaster: TemplateRef<unknown> | null =
        null;

    @Input() position: 'top' | 'bottom' = 'top';

    constructor(
        public navService: SpiNavigatorService,
        public toasterService: SpiToasterService
    ) {}

    public isLink(message: object): message is { to: string } {
        return message.hasOwnProperty('to');
    }
    public isCopy(message: object): message is { copy: string } {
        return message.hasOwnProperty('copy');
    }
    public isCustom(
        message: object
    ): message is { custom: string; text: string } {
        return message.hasOwnProperty('custom');
    }

    public toClipboard(event: MouseEvent, message: string) {
        event.preventDefault();
        event.stopImmediatePropagation();
        event.stopPropagation();
        // @ts-ignore
        navigator.clipboard.setContent({ 'text/plain': message });
    }
}
