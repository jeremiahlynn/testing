import { Component } from '@angular/core';
import {
    SpiTextComponent,
    SpiButtonComponent,
    SpiBackComponent,
} from '@spi-library';

@Component({
    standalone: true,
    selector: 'portraits-page',
    templateUrl: './portraits.component.html',
    styleUrl: './portraits.component.scss',
    imports: [SpiTextComponent, SpiButtonComponent, SpiBackComponent],
})
export class PortraitsPage {}
