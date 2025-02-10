import { Component } from '@angular/core';
import {
    SpiTextComponent,
    SpiButtonComponent,
    SpiBackComponent,
} from '@spi-library';

@Component({
    standalone: true,
    selector: 'yearbook-page',
    templateUrl: './yearbook.component.html',
    styleUrl: './yearbook.component.scss',
    imports: [SpiTextComponent, SpiButtonComponent, SpiBackComponent],
})
export class YearbookPage {
    public stringValue = '';
}
