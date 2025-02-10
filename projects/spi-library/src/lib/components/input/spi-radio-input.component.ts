import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SpiTextComponent } from '../text';

/**
 * @selector `<spi-checkbox-input>`
 * @input `disabled`
 * @input `value`
 * @input `key`
 * @output `valueChange` - called whenever the radio input is changed
 * @cssvar `--color` - used to overwrite the input's primary colors
 * @cssvar `--background` - used to overwrite the input's background colors
 * @cssvar `--disabled` - used to overwrite the input's disabled colors
 * @cssvar `--spacing` - used to overwrite the the space between the input and the label
 */
@Component({
    standalone: true,
    selector: 'spi-radio-input',
    templateUrl: './spi-radio-input.component.html',
    styleUrl: './spi-radio-input.component.scss',
    host: {
        '(click)': 'handleHostClick($event)',
        '[class.disabled]': 'disabled !== false',
    },
    imports: [CommonModule, SpiTextComponent],
})
export class SpiRadioInputComponent {
    @Input({ required: true }) key!: string;
    @Input({ required: true }) value!: string;
    @Output() valueChange = new EventEmitter<string>();
    @Input() disabled: '' | boolean = false;

    handleHostClick(event: MouseEvent) {
        if (this.disabled === false) {
            this.valueChange.emit(this.key);
        }
    }
}
