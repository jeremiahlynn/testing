import { computed, Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export abstract class SpiNavigatorService {
    private selected = signal('');
    private backStack = signal<string[]>([]);
    private forwardStack = signal<string[]>([]);

    public canGoBack = computed(() => this.backStack().length > 0);
    public canGoForward = computed(() => this.forwardStack().length > 0);

    public back() {
        if (this.canGoBack()) {
            this.backStack.update((backStack) => {
                const page = backStack.pop();
                this.forwardStack.update((forwardStack) => [
                    ...forwardStack,
                    this.selected(),
                ]);
                this.selected.set(page!);
                return [...backStack];
            });
        }
    }

    public forward() {
        if (this.canGoForward()) {
            this.forwardStack.update((forwardStack) => {
                const page = forwardStack.pop();
                this.backStack.update((backStack) => [
                    ...backStack,
                    this.selected(),
                ]);
                this.selected.set(page!);
                return [...forwardStack];
            });
        }
    }

    public resolve(page: string, fullPath = '') {
        const pathParts = [];
        const pageParts = page.split('/');

        if (pageParts[0] === '~') {
            if (fullPath !== '') {
                const previousParts = fullPath.split('/');
                let index = 0;
                for (const previous of previousParts) {
                    pathParts.push(previous);
                    index++;
                }
            }

            pageParts.shift();
        } else if (pageParts[0] === '.') {
            const previousParts = this.selected().split('/');
            for (const previous of previousParts) {
                pathParts.push(previous);
            }
            pageParts.shift();
        } else if (pageParts[0] === '..') {
            const previousParts = this.selected().split('/');
            previousParts.pop();
            for (const previous of previousParts) {
                pathParts.push(previous);
            }
            pageParts.shift();
        } else if (pageParts[0] === '') {
            pageParts.shift();
        }

        for (const part of pageParts) {
            if (part === '.') continue;

            if (part === '..') pathParts.pop();
            else {
                pathParts.push(part);
            }
        }

        return pathParts.join('/');
    }

    public goTo(path: string) {
        if (path.startsWith('/')) path = path.slice(1);

        if (this.selected() === path) return;
        this.forwardStack.set([]);

        if (this.selected() !== '') {
            this.backStack.update((backStack) => [
                ...backStack,
                this.selected(),
            ]);
        }

        this.selected.set(path);
    }

    public path = this.selected.asReadonly();
}
