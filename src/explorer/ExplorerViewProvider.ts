import * as admin from "firebase-admin";
import * as vscode from 'vscode';

import initializeFirestore from "../utilities/initializeFirestore";
import { CollectionItem, DocumentItem, Item, ShowMoreItemsItem } from "./items";

export default class DocumentsListProvider implements vscode.TreeDataProvider<Item> {
    private _onDidChangeTreeData = new vscode.EventEmitter<Item | undefined>();
    private _paging: { [key: string]: number } = {};

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

    async getParent(element: Item): Promise<Item | undefined> {
        if (element instanceof DocumentItem) {
            return this.getCollection(element.reference.parent);
        } else if (element instanceof CollectionItem) {
            if (element.reference.parent !== null) {
                return this.getDocument(element.reference.parent);
            }
        }
    }

    async getChildren(element?: DocumentItem | CollectionItem): Promise<Item[] | undefined> {
        console.log("Children requested");
        const firestore = await initializeFirestore();
        if (!element) {
            const refs = await firestore.listCollections();

            return refs.map(ref => new CollectionItem(ref.id, ref));
        } else if (element instanceof DocumentItem) {
            const refs = await element.reference.listCollections();

            return refs.map(ref => new CollectionItem(ref.id, ref));
        } else if (element instanceof CollectionItem) {
            const limit = this._paging[element.reference.path] ?? vscode.workspace.getConfiguration().get("firestore-explorer.pagingLimit");

            const snapshots = await element.reference.limit(limit + 1).get();

            const items: DocumentItem[] = [];

            snapshots.forEach((snapshot) => {
                items.push(new DocumentItem(snapshot.id, snapshot.ref));
            });

            if (items.length > limit) {
                items.pop();
                return [...items, new ShowMoreItemsItem(element.reference, limit)];
            } else {
                return items;
            }
        }
    }

    async getCollection(ref: admin.firestore.CollectionReference): Promise<CollectionItem> {
        const docs = await ref.limit(1).get();
        return new CollectionItem(ref.id, ref, docs.size === 0);
    }

    async getDocument(ref: admin.firestore.DocumentReference): Promise<DocumentItem> {
        const collections = await ref.listCollections();
        return new DocumentItem(ref.id, ref, collections.length === 0);
    }

    async showMoreItems(path: string) {
        const defaultLimit = vscode.workspace.getConfiguration().get("firestore-explorer.pagingLimit") as number;
        const newLimit = (this._paging[path] ?? defaultLimit) + defaultLimit;
        console.log(`Showing more items (${newLimit})...`);
        this._paging[path] = newLimit;
        this.refresh();
    }
}