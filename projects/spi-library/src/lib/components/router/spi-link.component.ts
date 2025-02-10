import {
    AfterViewInit,
    Component,
    computed,
    ElementRef,
    HostBinding,
    HostListener,
    Input,
    signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpiNavigatorService } from '../../services/spi-navigator.service';

@Component({
    standalone: true,
    selector: 'spi-link',
    imports: [CommonModule],
    template: `<ng-content />`,
})
export class SpiLinkComponent {
    @Input({ required: true }) to!: string;
    @Input() disabled: '' | boolean = false;

    @HostBinding('class.disabled') get isDisabled() {
        return this.disabled !== false;
    }

    @HostListener('click', [])
    click() {
        if (this.disabled === false) {
            this.navService.goTo(
                this.element.nativeElement.getAttribute('_spi_to')
            );
        }
    }

    constructor(
        private element: ElementRef,
        private navService: SpiNavigatorService
    ) {}
}
