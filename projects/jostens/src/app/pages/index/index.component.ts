import { Component } from '@angular/core';
import {
    SpiTextComponent,
    SpiButtonComponent,
    SpiBackComponent,
} from '@spi-library';

@Component({
    standalone: true,
    selector: 'index-page',
    templateUrl: './index.component.html',
    styleUrl: './index.component.scss',
    imports: [SpiTextComponent, SpiButtonComponent, SpiBackComponent],
})
export class IndexPage {}
