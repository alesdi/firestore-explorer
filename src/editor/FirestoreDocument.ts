import * as vscode from "vscode";

export class FirestoreDocument implements vscode.FileStat {
    type: vscode.FileType;
    ctime: number;
    mtime: number;
    size: number;

    id: string;
    data?: Uint8Array;
    collections: Map<string, FirestoreCollection>;

    constructor(id: string) {
        this.type = vscode.FileType.File;
        this.ctime = Date.now();
        this.mtime = Date.now();
        this.size = 0;
        this.id = id;
        this.collections = new Map();
    }
}

export class FirestoreCollection implements vscode.FileStat {
    type: vscode.FileType;
    ctime: number;
    mtime: number;
    size: number;

    id: string;
    documents: Map<string, FirestoreDocument>;

    constructor(id: string) {
        this.type = vscode.FileType.Directory;
        this.ctime = Date.now();
        this.mtime = Date.now();
        this.size = 0;
        this.id = id;
        this.documents = new Map();
    }
}