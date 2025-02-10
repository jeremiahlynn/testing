import { Component, CUSTOM_ELEMENTS_SCHEMA, Input } from '@angular/core';

/**
 * @selector `<spi-text>`
 * @input `varient`
 * @input `disabled` - will make the text take the disabled color
 * @cssvar `--font-size` - used to set the font size
 * @cssvar `--font-style` - used to set the font style
 * @cssvar `--font-weight` - used to set the font weight
 * @cssvar `--color` - used to overwrite the text color
 * @cssvar `--disabled` - used to overwrite the disabled text color
 */
@Component({
    standalone: true,
    selector: 'spi-text',
    templateUrl: './spi-text.component.html',
    styleUrl: './spi-text.component.scss',
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SpiTextComponent {
    @Input() variant: 'body' = 'body';
    @Input() disabled: '' | boolean = false;
}
