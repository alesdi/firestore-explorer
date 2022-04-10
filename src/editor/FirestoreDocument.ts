import * as vscode from "vscode";

/**
 * A class representing a Firestore document as a vscode file
 */
export class FirestoreDocument implements vscode.FileStat {
    type: vscode.FileType;
    ctime: number;
    mtime: number;
    size: number;

    id: string;
    data?: Uint8Array;

    constructor(id: string) {
        this.type = vscode.FileType.File;
        this.ctime = Date.now();
        this.mtime = Date.now();
        this.size = 0;
        this.id = id;
    }
}