import { Component } from '@angular/core';
import {
    SpiTextComponent,
    SpiButtonComponent,
    SpiBackComponent,
} from '@spi-library';

@Component({
    standalone: true,
    selector: 'designs-page',
    templateUrl: './designs.component.html',
    styleUrl: './designs.component.scss',
    imports: [SpiTextComponent, SpiButtonComponent, SpiBackComponent],
})
export class DesignsPage {}
