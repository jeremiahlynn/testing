import { Component, CUSTOM_ELEMENTS_SCHEMA, Input } from '@angular/core';

/**
 * @selector `<spi-divider>`
 * @input `varient`
 * @cssvar `--height` - used to overwrite the height of the divider
 * @cssvar `--color` - used to overwrite the color of the divider
 */
@Component({
    standalone: true,
    selector: 'spi-divider',
    template: ``,
    host: {
        '[class]': `variant`,
    },
    styleUrl: './spi-divider.component.scss',
})
export class SpiDividerComponent {
    @Input() variant: '' | 'medium' = '';
}
