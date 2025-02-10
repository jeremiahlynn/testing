import { Component } from '@angular/core';
import {
    SpiTextComponent,
    SpiButtonComponent,
    SpiBackComponent,
} from '@spi-library';

@Component({
    standalone: true,
    selector: 'quickcrop-page',
    templateUrl: './quickcrop.component.html',
    styleUrl: './quickcrop.component.scss',
    imports: [SpiTextComponent, SpiButtonComponent, SpiBackComponent],
})
export class QuickCropPage {}
