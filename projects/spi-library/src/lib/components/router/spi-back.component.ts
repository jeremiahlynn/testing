import { Component, HostBinding, HostListener, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpiNavigatorService } from '../../services/spi-navigator.service';

@Component({
    standalone: true,
    selector: 'spi-back',
    imports: [CommonModule],
    template: `<ng-content />`,
})
export class SpiBackComponent {
    @Input() disabled: '' | boolean = false;

    @HostBinding('class.active') get isActiveClass() {
        return this.navService.canGoBack();
    }

    @HostBinding('class.disabled') get isDisabled() {
        return this.disabled !== false;
    }

    @HostListener('click', [])
    click() {
        if (this.disabled === false) {
            this.navService.back();
        }
    }

    constructor(private navService: SpiNavigatorService) {}
}
