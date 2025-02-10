// Ensure TSConfig points paths @spi-types -> The UXP-Types library
import { indesign } from '@spi-types';
import { SpiFileUtils } from './spi-file.util';

const { app, UserInteractionLevels } = indesign;
type Document = indesign.Document;

class InDesignUtils {
    public setSettings() {
        const userInteractionLevel = app.scriptPreferences.userInteractionLevel;

        app.scriptPreferences.userInteractionLevel =
            UserInteractionLevels.NEVER_INTERACT;

        return { userInteractionLevel };
    }

    public restoreSettings(settings: ReturnType<this['setSettings']>) {
        app.scriptPreferences.userInteractionLevel =
            settings.userInteractionLevel;
    }

    public relink = async (document: Document) => {
        const docFolder = await document.filePath;
        const graphics = document.allGraphics;

        if (graphics.length === 0) return;
        const [gotLinksFolder, linksFolder] = await SpiFileUtils.getFolder(
            docFolder,
            'Links'
        );
        if (!gotLinksFolder) return;

        for (const graphic of graphics) {
            const link = graphic.itemLink;
            const [gotLinkedImage, linkedImage] = await SpiFileUtils.getFile(
                linksFolder,
                link.name
            );
            if (!gotLinkedImage) continue;
            link.relink(linkedImage);
        }
    };
}

export const SpiInDesignUtils = new InDesignUtils();
