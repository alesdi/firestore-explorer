import * as admin from "firebase-admin";
import * as vscode from 'vscode';

import { initializeFirebase } from "../initializeFirebase";
import { CollectionItem, DocumentItem, Item, MoreDocumentsItem } from "./items";

export default class DocumentsListProvider implements vscode.TreeDataProvider<Item> {
    private _onDidChangeTreeData = new vscode.EventEmitter<Item | undefined>();

    readonly onDidChangeTreeData: vscode.Event<Item | undefined> = this
        ._onDidChangeTreeData.event;

    refresh(): void {
        this._onDidChangeTreeData.fire(undefined);
    }

    async getTreeItem(element: Item): Promise<vscode.TreeItem> {
        if (element instanceof CollectionItem) {
            return this.getCollection(element.reference);
        } else if (element instanceof DocumentItem) {
            return this.getDocument(element.reference);
        } else {
            return element;
        }
    }

    async getChildren(element?: DocumentItem | CollectionItem): Promise<Item[] | undefined> {
        console.log("Children requested");
        await initializeFirebase();
        const firestore = admin.app().firestore();
        if (!element) {
            const refs = await firestore.listCollections();

            return refs.map(ref => new CollectionItem(ref.id, ref));
        } else if (element instanceof DocumentItem) {
            const refs = await element.reference.listCollections();

            return refs.map(ref => new CollectionItem(ref.id, ref));
        } else if (element instanceof CollectionItem) {
            const maximumSize = 10;

            const snapshots = await element.reference.limit(maximumSize + 1).get();

            const items: DocumentItem[] = [];

            snapshots.forEach((snapshot) => {
                items.push(new DocumentItem(snapshot.id, snapshot.ref));
            });

            if (items.length > maximumSize) {
                items.pop();
                return [...items, new MoreDocumentsItem(element.reference, maximumSize)];
            } else {
                return items;
            }
        }
    }

    async getCollection(ref: admin.firestore.CollectionReference): Promise<CollectionItem> {
        const docs = await ref.limit(1).get();
        console.log(docs);
        return new CollectionItem(ref.id, ref, docs.size === 0);
    }

    async getDocument(ref: admin.firestore.DocumentReference): Promise<DocumentItem> {
        const collections = await ref.listCollections();
        return new DocumentItem(ref.id, ref, collections.length === 0);
    }
}