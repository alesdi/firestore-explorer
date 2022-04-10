import * as admin from "firebase-admin";
import * as vscode from 'vscode';

export class Item extends vscode.TreeItem { }

export class DocumentItem extends Item {
    reference: admin.firestore.DocumentReference;

    constructor(public id: string, reference: admin.firestore.DocumentReference, isEmpty: boolean = false) {
        super(id, vscode.TreeItemCollapsibleState.None);
        this.command = { command: "firestore-explorer.openDocument", title: "Open", arguments: [this] };

        this.reference = reference;
        this.contextValue = 'document';
        this.tooltip = reference.path;
        this.iconPath = new vscode.ThemeIcon("file");
        this.collapsibleState = isEmpty ? vscode.TreeItemCollapsibleState.None : vscode.TreeItemCollapsibleState.Collapsed;
    }
}

export class CollectionItem extends Item {
    reference: admin.firestore.CollectionReference;

    constructor(public id: string, reference: admin.firestore.CollectionReference, isEmpty: boolean = false) {
        super(id, vscode.TreeItemCollapsibleState.Collapsed);

        this.reference = reference;
        this.contextValue = 'collection';
        this.tooltip = reference.path;
        this.iconPath = new vscode.ThemeIcon("folder");
        this.collapsibleState = isEmpty ? vscode.TreeItemCollapsibleState.None : vscode.TreeItemCollapsibleState.Collapsed;
    }
}

export class MoreDocumentsItem extends Item {
    reference: admin.firestore.CollectionReference;
    offset: number;

    constructor(reference: admin.firestore.CollectionReference, offset: number) {
        super("More documents...", vscode.TreeItemCollapsibleState.None,);

        this.reference = reference;
        this.offset = offset;
        this.iconPath = new vscode.ThemeIcon("more");
        // TODO: Show more documents
    }
}