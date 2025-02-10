import { Injectable } from '@angular/core';
import { SpiEventListenerService } from '@spi-library';
import { uxp, host, indesign, photoshop } from '@spi-types';

export interface IDocument {
    name: string;
    id: number;
    saved: boolean;
    fullName?: uxp.storage.File;
    path?: string;
}

@Injectable({
    providedIn: 'root',
})
export class DocumentService extends SpiEventListenerService<IDocument | null> {
    protected override initialState(): IDocument | null {
        return null;
    }

    protected override addEventListeners(updater: () => Promise<void>): void {
        if (host === 'InDesign') {
            const { app, DocumentEvent, Event } = indesign;
            app.addEventListener(Event.AFTER_ACTIVATE, updater);
            app.addEventListener(DocumentEvent.AFTER_SAVE, updater);
            app.addEventListener(DocumentEvent.AFTER_SAVE_AS, updater);
            app.addEventListener(DocumentEvent.AFTER_OPEN, updater);
            app.addEventListener(DocumentEvent.BEFORE_CLOSE, updater);
        }

        if (host === 'Photoshop') {
            photoshop.action.addNotificationListener(
                ['open', 'select', 'backgroundSaveCompleted', 'close', 'make'],
                updater
            );
        }
    }

    protected override removeEventListeners(
        updater: () => Promise<void>
    ): void {
        if (host === 'InDesign') {
            const { app, DocumentEvent, Event } = indesign;
            app.removeEventListener(Event.AFTER_ACTIVATE, updater);
            app.removeEventListener(DocumentEvent.AFTER_SAVE, updater);
            app.removeEventListener(DocumentEvent.AFTER_SAVE_AS, updater);
            app.removeEventListener(DocumentEvent.AFTER_OPEN, updater);
            app.removeEventListener(DocumentEvent.BEFORE_CLOSE, updater);
        }

        if (host === 'Photoshop') {
            photoshop.action.removeNotificationListener(
                ['open', 'select'],
                updater
            );
        }
    }

    protected override async compareStates(
        oldState: IDocument | null,
        newState: IDocument | null
    ): Promise<boolean> {
        try {
            if ((oldState === newState) === null) return true;
            if (oldState === null || newState === null) return false;
            if (
                oldState.name !== newState.name ||
                oldState.id !== newState.id ||
                oldState.saved !== newState.saved
            ) {
                return false;
            }
        } catch (e) {
            return false;
        }

        try {
            if (host === 'InDesign') {
                const oldFile = oldState.fullName;
                const newFile = newState.fullName;
                if (oldFile!.nativePath !== newFile!.nativePath) return false;
            }

            if (host === 'Photoshop') {
                if (oldState!.path !== newState!.path) return false;
            }
        } catch (_) {
        } finally {
            return true;
        }
    }

    protected override async collectState(): Promise<IDocument | null> {
        if (host === 'InDesign') {
            const { app } = indesign;
            const doc = app.documents.item(0);
            if (doc.isValid) {
                return {
                    name: doc.name,
                    saved: doc.saved,
                    id: doc.id,
                    fullName: doc.saved ? await doc.fullName : undefined,
                };
            }
        } else if (host === 'Photoshop') {
            const { app } = photoshop;
            const doc = app.activeDocument;
            if (doc) {
                return {
                    name: doc.name,
                    saved: doc.saved,
                    id: doc.id,
                    path: doc.path,
                };
            }
        }

        return null;
    }
}
