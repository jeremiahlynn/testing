import {
    Component,
    ElementRef,
    EventEmitter,
    Input,
    Output,
} from '@angular/core';
import { SpiTextComponent } from '../text';

@Component({
    standalone: true,
    selector: 'spi-prompt',
    templateUrl: './spi-prompt.component.html',
    styleUrl: './spi-prompt.component.scss',
    host: {
        '(window:click)': `handleClick($event)`,
        '[class.hidden]': `!shown`,
        '[style.background-color]': `backgroundColor`,
    },
    imports: [SpiTextComponent],
})
export class SpiPromptComponent {
    @Input() clickOutsideToClose: '' | boolean = false;
    @Input() backgroundColor: string = 'rgba(0,0,0,0.5)';
    @Input() containerColor: string = 'var(--theme-background)';
    @Input() shown: boolean = false;
    @Output() shownChange: EventEmitter<boolean> = new EventEmitter<boolean>();

    constructor(private element: ElementRef) {}

    handleClick(event: MouseEvent) {
        if (
            this.clickOutsideToClose !== false &&
            event.target === this.element.nativeElement
        ) {
            this.shownChange.emit(false);
        }
    }
}
