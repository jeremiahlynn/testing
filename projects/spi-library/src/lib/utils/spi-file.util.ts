import JSZip from 'jszip';

// Ensure TSConfig points paths @spi-types -> The UXP-Types library
import { uxp } from '@spi-types';

type File = uxp.storage.File;
type Folder = uxp.storage.Folder;
type Entry = uxp.storage.Entry;
const { formats } = uxp.storage;

class FileUtils {
    public isFolder = (entry: Entry): entry is Folder => {
        if (entry.isFolder) return true;
        return false;
    };

    public isFile = (entry: Entry): entry is File => {
        if (entry.isFile) return true;
        return false;
    };

    public getFiles = async (folder: Folder, fileExtension: string) => {
        const files: File[] = [];
        const entries = await folder.getEntries();
        for (const entry of entries) {
            if (this.isFile(entry)) {
                const fileName = entry.name;
                if (fileName.endsWith(fileExtension)) {
                    files.push(entry);
                }
            } else if (this.isFolder(entry)) {
                const childrenEntries = await entry.getEntries();
                childrenEntries.map((entry) => entries.push(entry));
            }
        }
        return files;
    };

    /**
     * Used to convert a url to a valid file name
     * @returns
     */
    public urlToFileName = (url: string): string => {
        // Remove protocol, if present
        let fileName = url.replace(/https?:\/\//, '');

        // Replace characters that are invalid for file names on most systems
        fileName = fileName.replace(/[^a-zA-Z0-9_\-\.]/g, '_');

        // Trim trailing periods and spaces
        fileName = fileName.replace(/[. ]+$/, '');

        // Limit file name length to 255 characters (common file name limit)
        fileName = fileName.substring(0, 255);

        return fileName;
    };

    public deleteEntry: (entry: Entry) => Promise<[true] | [false, unknown]> =
        async (entry) => {
            if (this.isFolder(entry)) {
                let entries = await entry.getEntries();

                for (const entry of entries) {
                    const [success, e] = await this.deleteEntry(entry);
                    if (!success) {
                        return [false, e];
                    }
                }
            }

            try {
                await entry.delete();
                return [true];
            } catch (e: unknown) {
                return [false, e];
            }
        };

    public extractZipToFolder = async (zip: JSZip, folder: Folder) => {
        const validEntries = Object.entries(zip.files).filter(
            ([name]) => !(name.includes('.DS') || name.includes('__MACOSX'))
        );

        for (const [name, file] of validEntries) {
            if (file.dir) continue;

            const entries = name.split('/');
            const fileName = entries.pop()!;

            let folderLocator = folder;
            for (const entry of entries) {
                try {
                    const nextEntry = await folderLocator.getEntry(entry);
                    if (this.isFolder(nextEntry)) {
                        folderLocator = nextEntry;
                    } else {
                        this.deleteEntry(nextEntry);
                        throw 'Found a file somehow';
                    }
                } catch (_) {
                    folderLocator = await folderLocator.createFolder(entry);
                }
            }

            const fileLocator = await folderLocator.createFile(fileName, {
                overwrite: true,
            });

            const ab = await file.async('arraybuffer');

            await fileLocator.write(ab, {
                format: formats.binary,
            });
        }
    };

    public zipFolderContents = async (folder: Folder) => {
        const recurse = async (zip: JSZip, folder: Folder) => {
            const entries = await folder.getEntries();

            const files = entries.filter((entry) => this.isFile(entry));
            const folders = entries.filter((entry) => this.isFolder(entry));

            for (const file of files) {
                zip.file(
                    file.name,
                    await file.read({ format: formats.binary })
                );
            }

            for (const subfolder of folders) {
                const child = zip.folder(subfolder.name)!;
                await recurse(child, subfolder);
            }
        };

        const zip = new JSZip();
        await recurse(zip, folder);
        return zip;
    };

    public areEqual(e1: Entry, e2: Entry) {
        return (
            this.santizeNativePath(e1.nativePath) ===
            this.santizeNativePath(e2.nativePath)
        );
    }

    public santizeNativePath(path: string) {
        if (path.startsWith('/private')) {
            return path.replace('/private', '');
        }
        return path;
    }

    public createFolder = async (folder: Folder, newFolder: string) => {
        try {
            const entry = await folder.createFolder(newFolder);
            return [true, entry] as [true, Folder];
        } catch (_) {
            return [false, 'Could not create folder'] as [false, string];
        }
    };

    /**
     * @param folder The starting folder
     * @param path The path of the file to find
     * @param create Should the folder be created if it doesn't exist; default `false`
     */
    public getFolder = async (folder: Folder, path: string, create = false) => {
        try {
            const entry = await folder.getEntry(path);
            if (this.isFile(entry)) {
                return [false, 'Entry is a file'] as [false, string];
            } else {
                return [true, entry] as [true, Folder];
            }
        } catch (_) {
            if (create) {
                return this.createFolder(folder, path);
            } else {
                return [false, 'File does not exist'] as [false, string];
            }
        }
    };

    public createFile = async (folder: Folder, path: string) => {
        try {
            const entry = await folder.createFile(path, { overwrite: true });
            return [true, entry] as [true, File];
        } catch (_) {
            return [false, 'Could not create file'] as [false, string];
        }
    };

    public getFile = async (folder: Folder, path: string, create = false) => {
        try {
            const entry = await folder.getEntry(path);
            if (this.isFolder(entry)) {
                return [false, 'Entry is a folder'] as [false, string];
            } else {
                return [true, entry] as [true, File];
            }
        } catch (_) {
            if (create) {
                return this.createFile(folder, path);
            } else {
                return [false, 'Folder does not exist'] as [false, string];
            }
        }
    };

    public readJSONFile = async (file: File) => {
        const templateData = await file.read({
            format: formats.utf8,
        });
        return JSON.parse(templateData);
    };

    public writeJSONFile = async (file: File, data: any) => {
        await file.write(JSON.stringify(data), {
            append: false,
            format: formats.utf8,
        });
    };
}

export const SpiFileUtils = new FileUtils();
