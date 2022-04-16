import * as admin from "firebase-admin";
import * as vscode from 'vscode';

export abstract class Item extends vscode.TreeItem {
    abstract reference: admin.firestore.DocumentReference | admin.firestore.CollectionReference;
}

/**
 * A Tree View item representing a Firestore document.
 */
export class DocumentItem extends Item {
    constructor(
        public documentId: string,
        public reference: admin.firestore.DocumentReference,
        public size: number | undefined = undefined,
    ) {
        super(documentId, vscode.TreeItemCollapsibleState.None);
        this.command = { command: "firestore-explorer.openPath", title: "Open", arguments: [reference.path] };

        this.id = reference.path;
        this.contextValue = 'document';
        this.tooltip = reference.path;
        this.iconPath = new vscode.ThemeIcon("file");
        this.collapsibleState = size === 0 ? vscode.TreeItemCollapsibleState.None : vscode.TreeItemCollapsibleState.Collapsed;
    }

    withSize(size: number): DocumentItem {
        return new DocumentItem(this.documentId, this.reference, size);
    }
}


/**
 * A Tree View item representing a Firestore collection.
 */
export class CollectionItem extends Item {
    constructor(
        public collectionId: string,
        public reference: admin.firestore.CollectionReference,
        public orderBy: {
            fieldName: string,
            direction: admin.firestore.OrderByDirection
        } = { fieldName: 'id', direction: 'asc' },
        public size: number | undefined = undefined,
    ) {
        super(collectionId, vscode.TreeItemCollapsibleState.Collapsed);

        this.id = reference.path;
        this.contextValue = 'collection';
        this.tooltip = reference.path;
        this.iconPath = new vscode.ThemeIcon("folder");
        this.collapsibleState = size === 0 ? vscode.TreeItemCollapsibleState.None : vscode.TreeItemCollapsibleState.Collapsed;
        this.description = (orderBy.direction === 'asc' ? '↑' : '↓') + orderBy.fieldName;
    }

    withSize(size: number): CollectionItem {
        return new CollectionItem(this.collectionId, this.reference, this.orderBy, size);
    }
}


/**
 * A Tree View item representing the "Show more" button
 */
export class ShowMoreItemsItem extends Item {
    reference: admin.firestore.CollectionReference;
    offset: number;

    constructor(reference: admin.firestore.CollectionReference, offset: number) {
        const pagingLimit = vscode.workspace.getConfiguration().get("firestore-explorer.pagingLimit") as number;
        super(`Load ${pagingLimit} more`, vscode.TreeItemCollapsibleState.None,);
        this.reference = reference;
        this.id = reference.path + "///showMore";
        this.offset = offset;
        this.iconPath = new vscode.ThemeIcon("more");
        this.command = { command: "firestore-explorer.showMoreItems", title: "More Items", arguments: [reference.path] };
    }

    // TODO: Show progress animation when loading more items
}