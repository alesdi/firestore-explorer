import * as admin from "firebase-admin";
import { TextDecoder, TextEncoder } from "util";
import * as vscode from "vscode";
import { initializeFirebase } from "../initializeFirebase";

export class DocumentFileSystemProvider implements vscode.FileSystemProvider {
    private _emitter = new vscode.EventEmitter<vscode.FileChangeEvent[]>();

    readonly onDidChangeFile: vscode.Event<vscode.FileChangeEvent[]> = this._emitter.event;

    watch(uri: vscode.Uri): vscode.Disposable {
        // ignore, fires for all changes...
        return new vscode.Disposable(() => { });
    }

    async stat(uri: vscode.Uri): Promise<vscode.FileStat> {
        await initializeFirebase();
        const path = uri.path;
        console.log(`Opening document '${path}'`);
        const firestore = admin.app().firestore();
        const doc = await firestore.doc(path).get();

        const now = Date.now();

        return {
            type: vscode.FileType.File,
            ctime: doc.createTime?.toMillis() ?? now,
            mtime: doc.updateTime?.toMillis() ?? now,
            size: 0,
        };
    }

    readDirectory(uri: vscode.Uri): [string, vscode.FileType][] | Thenable<[string, vscode.FileType][]> {
        throw new Error("Read Directory Method not implemented.");
    }

    createDirectory(uri: vscode.Uri): void | Thenable<void> {
        throw new Error("Method not implemented.");
    }

    async readFile(uri: vscode.Uri): Promise<Uint8Array> {
        await initializeFirebase();
        const path = uri.path;
        console.log(`Opening document '${path}'`);
        const firestore = admin.app().firestore();
        const doc = firestore.doc(path);

        return (new TextEncoder()).encode(JSON.stringify((await doc.get()).data(), null, 2));
    }

    async writeFile(uri: vscode.Uri, content: Uint8Array, options: { readonly create: boolean; readonly overwrite: boolean; }): Promise<void> {
        await initializeFirebase();
        const path = uri.path;
        const firestore = admin.app().firestore();

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
        throw new Error("Delete Method not implemented.");
    }

    rename(oldUri: vscode.Uri, newUri: vscode.Uri, options: { readonly overwrite: boolean; }): void | Thenable<void> {
        throw new Error("Rename Method not implemented.");
    }
}