import { CommonModule } from '@angular/common';
import {
    Component,
    ElementRef,
    EventEmitter,
    Input,
    Output,
} from '@angular/core';

/**
 * @selector `<spi-checkbox-input>`
 * @input `disabled`
 * @input `value`
 * @output `valueChange` - called whenever the checkbox input is changed
 * @cssvar `--idle-[color|background|border]` - used to overwrite the input's idle colors
 * @cssvar `--disabled-[color|background|border]` - used to overwrite the input's disabled colors
 * @cssvar `--focused-[color|background|border]` - used to overwrite the input's focused colors
 * @cssvar `--hovered-[color|background|border]` - used to overwrite the input's selection hover color
 */
@Component({
    standalone: true,
    selector: 'spi-checkbox-input',
    templateUrl: './spi-checkbox-input.component.html',
    styleUrl: './spi-checkbox-input.component.scss',
    host: {
        '[tabindex]': 'disabled === false ? 0 : -1',
        '(keydown)': 'handleHostKeydown($event)',
        '(click)': 'handleHostClick($event)',
        '[class.disabled]': 'disabled !== false',
    },
    imports: [CommonModule],
})
export class SpiCheckboxInputComponent {
    constructor(private element: ElementRef) {}

    @Input({ required: true }) value!: boolean;
    @Output() valueChange: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Input() disabled: '' | boolean = false;

    handleHostKeydown(event: KeyboardEvent) {
        if (this.disabled === false) {
            switch (event.code) {
                case 'Space':
                case 'Enter':
                    this.valueChange.emit(!this.value);
                    break;
                case 'Escape':
                    this.element.nativeElement.blur();
                    break;
            }
        }
    }

    handleHostClick(event: MouseEvent) {
        if (this.disabled === false) {
            this.valueChange.emit(!this.value);
        }
    }
}
