import { Component } from '@angular/core';
import {
    SpiTextComponent,
    SpiButtonComponent,
    SpiBackComponent,
} from '@spi-library';

@Component({
    standalone: true,
    selector: 'images-page',
    templateUrl: './images.component.html',
    styleUrl: './images.component.scss',
    imports: [SpiTextComponent, SpiButtonComponent, SpiBackComponent],
})
export class ImagesPage {}
