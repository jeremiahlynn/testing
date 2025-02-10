import { Component } from '@angular/core';
import {
    SpiTextComponent,
    SpiNavigatorService,
    SpiLinkComponent,
    SpiButtonComponent,
} from '@spi-library';

@Component({
    standalone: true,
    selector: 'home-page',
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss',
    imports: [SpiLinkComponent, SpiButtonComponent],
})
export class HomePage {}
