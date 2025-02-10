import {
    AfterContentInit,
    AfterViewInit,
    Component,
    ContentChildren,
    effect,
    ElementRef,
    Input,
    QueryList,
    signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpiOutletComponent } from './spi-outlet.component';
import { SpiNavigatorService } from '../../services/spi-navigator.service';

@Component({
    standalone: true,
    selector: 'spi-router',
    imports: [CommonModule],
    template: `<ng-content></ng-content>`,
    styles: `
        :host {
            width: 100%;
            height: 100%;
        }
    `,
})
export class SpiRouterComponent implements AfterViewInit {
    @Input({ required: true }) default!: string;

    private elementRef = signal<HTMLElement | null>(null);

    ngAfterViewInit() {
        // const recurse = (children: any[], path: string) => {
        //     children.forEach((child) => {
        //         if (child.localName === 'spi-outlet') {
        //             const newPath = `${path}/${child.getAttribute('path')}`;
        //             child.setAttribute('_spi_path', newPath);
        //             recurse(child.children, newPath);
        //         } else if (child.localName === 'spi-link') {
        //             child.setAttribute('_spi_path', path);
        //         } else {
        //             recurse(child.children, path);
        //         }
        //     });
        // };

        this.elementRef.set(this.element.nativeElement);

        let element = this.element.nativeElement;
        // recurse(element.children, '');

        this.navService.goTo(this.default);
    }

    constructor(
        private element: ElementRef,
        public navService: SpiNavigatorService
    ) {
        effect(() => {
            const element = this.elementRef();
            if (!element) return;

            const path = this.navService.path();
            const pathParts = path.split('/');

            const [output, links] = parse(element.children, navService);

            let current = output;
            const fullPath: string[] = [];

            for (const path of pathParts) {
                fullPath.push(path);

                if (!current) break;

                const outlets = current.outlets.filter(
                    (outlet) => outlet.path === path
                );

                if (outlets.length === 0) {
                    if (current.fallback === null) break;

                    current.fallback.outlet.classList.remove('hidden');
                    current = current.subpaths[current.fallback.path];
                } else {
                    outlets.map((outlet) =>
                        outlet.outlet.classList.remove('hidden')
                    );

                    current = current.subpaths[path];
                }
            }

            links.map(({ link, path }) => {
                const parts = path.split('/');

                for (let i = 0; i < parts.length; i++) {
                    if (parts[i] !== fullPath[i]) return;
                }

                link.classList.add('active');
            });
        });
    }
}

type Structure = {
    outlets: any[];
    subpaths: { [key: string]: Structure };
    fallback: any;
};

function parse(
    children: any,
    navService: SpiNavigatorService
): [Structure, any[]] {
    const recurse = (
        tree: Structure,
        links: any[],
        children: any[],
        fullpath: ''
    ) => {
        children.forEach((child) => {
            if (child.localName === 'spi-outlet') {
                const path = child.getAttribute('path');
                if (!tree.subpaths.hasOwnProperty(path)) {
                    tree.subpaths[path] = {
                        outlets: [],
                        subpaths: {},
                        fallback: null,
                    };
                }

                const fallback = child.getAttribute('fallback');
                if (fallback === '') {
                    if (tree.fallback !== null) {
                        console.error(
                            'Found multiple fallbacks for <spi-router/>'
                        );
                    }
                    tree.fallback = { path: path, outlet: child };
                }

                tree.outlets.push({ path: path, outlet: child });

                child.classList.add('hidden');
                recurse(
                    tree.subpaths[path],
                    links,
                    child.children,
                    fullpath === '' ? path : `${fullpath}/${path}`
                );
            } else if (child.localName === 'spi-link') {
                const to = navService.resolve(
                    child.getAttribute('to'),
                    fullpath
                );
                child.classList.remove('active');
                child.setAttribute('_spi_to', to);

                links.push({
                    path: to,
                    link: child,
                });
                recurse(tree, links, child.children, fullpath);
            } else {
                recurse(tree, links, child.children, fullpath);
            }
        });
    };

    const parsed = { outlets: [], subpaths: {}, fallback: null };
    const links: any[] = [];
    recurse(parsed, links, children, '');
    return [parsed, links];
}
