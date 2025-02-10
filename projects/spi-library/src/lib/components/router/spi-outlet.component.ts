import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    standalone: true,
    selector: 'spi-outlet',
    imports: [CommonModule],
    styles: `
        :host {
            width: 100%;
            height: 100%;

            &.hidden {
                display: none;
            }
        }
    `,
    template: `<ng-content />`,
})
export class SpiOutletComponent {
    @Input({ required: true }) public path!: string;
    @Input() fallback: '' | undefined;
}
