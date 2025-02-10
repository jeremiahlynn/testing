import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

/**
 * @selector `<spi-progres>`
 * @input `percentage`
 * @cssvar `--color` - used to overwrite the input's idle colors
 * @cssvar `--background` - used to overwrite the input's disabled colors
 * @cssvar `--border` - used to overwrite the input's focused colors
 */
@Component({
    standalone: true,
    selector: 'spi-progress',
    templateUrl: './spi-progress.component.html',
    styleUrl: './spi-progress.component.scss',
    host: {
        '[class]': 'direction',
    },
    imports: [CommonModule],
})
export class SpiProgressComponent {
    @Input() percentage: number = 0;
    @Input() direction: 'left-to-right' | 'right-to-left' = 'left-to-right';
    @Input() contentPosition: 'left' | 'center' | 'right' = 'left';
}
