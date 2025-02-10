import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpiTextComponent } from '../text';

/**
 * @selector `<spi-button>`
 * @input `varient`
 * @input `disabled` - will make the text take the disabled color
 * @output `action` - called whenever the button is pressed or activated by keyboard
 * @cssvar `--font-size` - used to set the font size
 * @cssvar `--disabled-[color|background|border]` - used to overwrite the button's disabled colors
 * @cssvar `--hovered-[color|background|border]` - used to overwrite the button's hovered colors
 * @cssvar `--idle-[color|background|border]` - used to overwrite the button's idle colors
 */
@Component({
    standalone: true,
    selector: 'spi-button',
    templateUrl: './spi-button.component.html',
    styleUrl: './spi-button.component.scss',
    host: {
        '[class]': '"variant-" + variant',
        '[class.disabled]': 'disabled !== false',
        '(click)': 'disabled !== false || action.emit()',
    },
    imports: [SpiTextComponent, CommonModule],
})
export class SpiButtonComponent {
    @Input() variant: 'primary' | 'highlight' = 'primary';
    @Input() disabled: '' | boolean = false;
    @Output() action: EventEmitter<null> = new EventEmitter<null>();
}
