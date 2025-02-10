import { Component, HostBinding, HostListener, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpiNavigatorService } from '../../services/spi-navigator.service';

@Component({
    standalone: true,
    selector: 'spi-forward',
    imports: [CommonModule],
    template: `<ng-content />`,
})
export class SpiForwardComponent {
    @Input() disabled: '' | boolean = false;

    @HostBinding('class.active') get isActiveClass() {
        return this.navService.canGoForward();
    }

    @HostBinding('class.disabled') get isDisabled() {
        return this.disabled !== false;
    }

    @HostListener('click', [])
    click() {
        if (this.disabled === false) {
            this.navService.forward();
        }
    }

    constructor(private navService: SpiNavigatorService) {}
}
