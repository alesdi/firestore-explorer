import * as admin from "firebase-admin";
import * as vscode from 'vscode';
import { initializeFirebase } from "./initializeFirebase";

export class DocumentsListProvider implements vscode.TreeDataProvider<Item> {
    onDidChangeTreeData?: vscode.Event<void | Item | Item[] | null | undefined> | undefined;

    async getTreeItem(element: Item): Promise<vscode.TreeItem> {
        if (element instanceof Collection) {
            return this.getCollection(element.reference);
        } else if (element instanceof Document) {
            return this.getDocument(element.reference);
        } else {
            return element;
        }
    }

    async getChildren(element?: Document | Collection): Promise<Item[] | undefined> {
        console.log("Children requested");
        await initializeFirebase();
        const firestore = admin.app().firestore();
        if (!element) {
            const refs = await firestore.listCollections();

            return await refs.map(ref => new Collection(ref.id, ref));
        } else if (element instanceof Document) {
            const refs = await element.reference.listCollections();

            return await refs.map(ref => new Collection(ref.id, ref));
        } else if (element instanceof Collection) {
            const maximumSize = 10;

            const snapshots = await element.reference.limit(maximumSize + 1).get();

            const items: Document[] = [];

            snapshots.forEach((snapshot) => {
                items.push(new Document(snapshot.id, snapshot.ref));
            });

            if (items.length > maximumSize) {
                items.pop();
                return [...items, new MoreDocumentsItem(element.reference, maximumSize)];
            } else {
                return items;
            }
        }
    }

    async getCollection(ref: admin.firestore.CollectionReference): Promise<Collection> {
        const docs = await ref.limit(1).get();
        console.log("Got collection");
        console.log(docs);
        return new Collection(ref.id, ref, docs.size === 0);
    }

    async getDocument(ref: admin.firestore.DocumentReference): Promise<Document> {
        const collections = await ref.listCollections();
        return new Document(ref.id, ref, collections.length === 0);
    }
}

export class Item extends vscode.TreeItem {
}

export class Document extends Item {
    reference: admin.firestore.DocumentReference;

    constructor(public id: string, reference: admin.firestore.DocumentReference, isEmpty: boolean = false) {
        super(id, vscode.TreeItemCollapsibleState.None);
        this.command = { command: "firestore-explorer.openDocument", title: "Open", arguments: [this] };

        this.reference = reference;
        this.iconPath = new vscode.ThemeIcon("file");
        this.collapsibleState = isEmpty ? vscode.TreeItemCollapsibleState.None : vscode.TreeItemCollapsibleState.Collapsed;
    }
}

export class Collection extends Item {
    reference: admin.firestore.CollectionReference;

    constructor(public id: string, reference: admin.firestore.CollectionReference, isEmpty: boolean = false) {
        super(id, vscode.TreeItemCollapsibleState.Collapsed);

        this.reference = reference;
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