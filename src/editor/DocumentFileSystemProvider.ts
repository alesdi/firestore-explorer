import { TextDecoder, TextEncoder } from "util";
import * as vscode from "vscode";
import initializeFirestore from "../utilities/initializeFirestore";

/**
 * Custom File System provider that allows to interact with Firestore documents as
 * normal files in the editor.
 */
export class DocumentFileSystemProvider implements vscode.FileSystemProvider {
    private _emitter = new vscode.EventEmitter<vscode.FileChangeEvent[]>();

    readonly onDidChangeFile: vscode.Event<vscode.FileChangeEvent[]> = this._emitter.event;

    watch(uri: vscode.Uri): vscode.Disposable {
        // ignore, fires for all changes...
        return new vscode.Disposable(() => { });
    }

    async stat(uri: vscode.Uri): Promise<vscode.FileStat> {
        const path = uri.path;
        console.log(`Opening document '${path}'`);
        const firestore = await initializeFirestore();
        const doc = await firestore.doc(path).get();

        const now = Date.now();

        return {
            type: vscode.FileType.File,
            ctime: doc.createTime?.toMillis() ?? now,
            mtime: doc.updateTime?.toMillis() ?? now,
            size: 0, // TODO: Determine the actual size of the document in some way
        };
    }

    readDirectory(uri: vscode.Uri): [string, vscode.FileType][] | Thenable<[string, vscode.FileType][]> {
        // TODO: Does it make sense to implement this? Could it be used as a replacement for ExplorerDataProvider?
        throw new Error("Read Directory Method not implemented.");
    }

    createDirectory(uri: vscode.Uri): void | Thenable<void> {
        // TODO: Implement and add command to create a new collection
        throw new Error("Method not implemented.");
    }

    async readFile(uri: vscode.Uri): Promise<Uint8Array> {
        // Load the document content and present it as a JSON file
        // TODO: JSON cannot handle all the data types in Firestore (e.g. geopoint and timestamp). Consider alternatives or extensions.
        const path = uri.path;
        const firestore = await initializeFirestore();
        const doc = firestore.doc(path);

        return (new TextEncoder()).encode(JSON.stringify((await doc.get()).data(), null, 2));
    }

    async writeFile(uri: vscode.Uri, content: Uint8Array, options: { readonly create: boolean; readonly overwrite: boolean; }): Promise<void> {
        // Parse the JSON file and update the Firestore document
        const path = uri.path;
        const firestore = await initializeFirestore();

        let json = undefined;
        try {
            json = JSON.parse((new TextDecoder()).decode(content));
        } catch (e) {
            throw Error("Could not parse JSON. Please check your syntax.");
        }

        try {
            await firestore.doc(path).set(json);
        } catch (e) {
            throw Error("Could not write the Firestore document.");
        }
    }

    delete(uri: vscode.Uri, options: { readonly recursive: boolean; }): void | Thenable<void> {
        // TODO: Implement and add command to delete any document or collection
        throw new Error("Delete Method not implemented.");
    }

    rename(oldUri: vscode.Uri, newUri: vscode.Uri, options: { readonly overwrite: boolean; }): void | Thenable<void> {
        // TODO: Implement and add command to change the id of any document or collection
        throw new Error("Rename Method not implemented.");
    }
}