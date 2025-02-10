import {
    Component,
    ElementRef,
    EventEmitter,
    Input,
    Output,
    ViewChild,
} from '@angular/core';

/**
 * @selector `<spi-text-input>`
 * @input `disabled`
 * @input `value` - the actual text value
 * @output `valueChange` - called whenever the text input is changed
 * @cssvar `--text-color` - used to overwrite text color
 * @cssvar `--background-color` - used to overwrite the background color
 * @cssvar `--border-color` - used to overwrite the unfocused border color
 * @cssvar `--focused-color` - used to overwrite the focused border color
 * @cssvar `--disabled-text-color` - used to overwrite the disabled text color
 * @cssvar `--disabled-border-color` - used to overwrite the disabled border color
 * @cssvar `--disabled-background-color` - used to overwrite the disabled background color
 */
@Component({
    standalone: true,
    selector: 'spi-text-input',
    templateUrl: './spi-text-input.component.html',
    styleUrl: './spi-text-input.component.scss',
    host: {
        '[class.disabled]': 'disabled',
        '[class.focused]': 'focused',
        '(click)': 'clickContainer($event)',
        '(window:click)': 'clickWindow()',
    },
    imports: [],
})
export class SpiTextInputComponent {
    private _disabled: boolean = false;
    @Input() set disabled(value: '' | boolean) {
        this._disabled = value !== false;
    }
    get disabled() {
        return this._disabled;
    }

    @Input({ required: true }) value!: string;
    @Output() valueChange = new EventEmitter<string>();
    @ViewChild('input', { static: true }) inputRef!: ElementRef;
    public focused: boolean = false;

    public clickContainer(e: Event) {
        this.inputRef.nativeElement.focus();
        e.stopImmediatePropagation();
    }

    public clickWindow() {
        this.inputRef.nativeElement.blur();
    }
}
