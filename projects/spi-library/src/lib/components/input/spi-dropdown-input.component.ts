import { CommonModule } from '@angular/common';
import {
    Component,
    ElementRef,
    EventEmitter,
    Input,
    Output,
    ViewChild,
} from '@angular/core';

/**
 * @selector `<spi-dropdown-input>`
 * @input `disabled`
 * @input `closeOnOtherOpened` - if the dropdown should close when you open another dropdown
 * @input `closeOnClickOutside - if the dropdown should close when you click outside of it
 * @input `options` - the dropdown options
 * @input `value` - the actual text value
 * @output `valueChange` - called whenever the text input is changed
 * @cssvar `--text-color` - used to overwrite text color
 * @cssvar `--background-color` - used to overwrite the background color
 * @cssvar `--border-color` - used to overwrite the unfocused border color
 * @cssvar `--hovered-color` - used to overwrite the hovered option color
 * @cssvar `--selected-color` - used to overwrite the selected color
 * @cssvar `--disabled-text-color` - used to overwrite the disabled text color
 * @cssvar `--disabled-border-color` - used to overwrite the disabled border color
 * @cssvar `--disabled-background-color` - used to overwrite the disabled background color
 */
@Component({
    standalone: true,
    selector: 'spi-dropdown-input',
    templateUrl: './spi-dropdown-input.component.html',
    styleUrl: './spi-dropdown-input.component.scss',
    host: {
        '[class.disabled]': 'disabled',
        '[class.opened]': 'opened',
        '(click)': 'disabled || clickContainer()',
        '(window:click)': 'clickWindow($event)',
    },
    imports: [CommonModule],
})
export class SpiDropdownInputComponent {
    private _disabled: boolean = false;
    @Input() set disabled(value: '' | boolean) {
        this._disabled = value !== false;
    }
    get disabled() {
        return this._disabled;
    }

    @Input() closeOnClickOutside: boolean = true;
    @Input() closeOnOtherOpened: boolean = true;
    @Input({ required: true }) value!: string;
    @Output() valueChange = new EventEmitter<string>();
    @Input({ required: true }) options!: string[];

    @ViewChild('list', { static: false }) listRef!: ElementRef;
    @ViewChild('container', { static: false }) containerRef?: ElementRef;

    constructor(private el: ElementRef) {}

    public opened: boolean = false;

    public clickContainer() {
        this.opened = !this.opened;
    }

    public clickWindow(e: Event) {
        if (e.target !== this.el.nativeElement) {
            //@ts-ignore

            if (e.target.nodeName === 'SPI-DROPDOWN-INPUT') {
                if (this.closeOnOtherOpened) {
                    this.opened = false;
                }
            } else {
                if (this.closeOnClickOutside) {
                    this.opened = false;
                }
            }
        }
    }

    select(val: string, e: Event): void {
        this.valueChange.emit(val);
        this.opened = false;
        e.stopImmediatePropagation();
    }
}
