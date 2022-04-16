import * as admin from "firebase-admin";
import * as vscode from 'vscode';

import initializeFirestore from "../utilities/initializeFirestore";
import { CollectionItem, DocumentItem, Item, ShowMoreItemsItem } from "./items";

/**
 * Provides the Firestore Explorer Tree View data.
 */
export default class ExplorerDataProvider implements vscode.TreeDataProvider<Item> {
    // TODO: Consider using Firestore subscriptions to dynamically update the tree view.
    // TODO: Implement basic queries
    // TODO: Allow to display only a sub-collection

    private _onDidChangeTreeData = new vscode.EventEmitter<Item | undefined>();
    private _paging: { [key: string]: number } = {};

    readonly onDidChangeTreeData: vscode.Event<Item | undefined> = this
        ._onDidChangeTreeData.event;

    refresh(): void {
        this._onDidChangeTreeData.fire(undefined);
    }

    async getTreeItem(element: Item): Promise<vscode.TreeItem> {
        if (element instanceof CollectionItem) {
            return this.getCollectionWithChildren(element.reference);
        } else if (element instanceof DocumentItem) {
            return this.getDocumentWithChildren(element.reference);
        } else {
            return element;
        }
    }

    async getParent(element: Item): Promise<Item | undefined> {
        if (element instanceof DocumentItem) {
            return this.getCollectionWithChildren(element.reference.parent);
        } else if (element instanceof CollectionItem) {
            if (element.reference.parent !== null) {
                return this.getDocumentWithChildren(element.reference.parent);
            }
        }
    }

    async getChildren(element?: DocumentItem | CollectionItem): Promise<Item[] | undefined> {
        const firestore = await initializeFirestore();
        if (!element) {
            const refs = await firestore.listCollections();

            return refs.map(ref => new CollectionItem(ref.id, ref));
        } else if (element instanceof DocumentItem) {
            const refs = await element.reference.listCollections();

            return refs.map(ref => new CollectionItem(ref.id, ref));
        } else if (element instanceof CollectionItem) {
            const limit = this._paging[element.reference.path] ?? vscode.workspace.getConfiguration().get("firestore-explorer.pagingLimit");

            const snapshots = await element.reference
                .limit(limit + 1)
                .orderBy(admin.firestore.FieldPath.documentId())
                .get();

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

    /**
     * Retrieves children for the given collection and returns the same collection with the isEmpty flag set.
     * @param  {admin.firestore.CollectionReference} ref
     * @returns Promise
     */
    async getCollectionWithChildren(ref: admin.firestore.CollectionReference): Promise<CollectionItem> {
        const docs = await ref.limit(1).get();
        return new CollectionItem(ref.id, ref, docs.size === 0);
    }

    /**
     * Retrieves children for the given document and returns the same document with the isEmpty flag set.
     * @param  {admin.firestore.DocumentReference} ref
     * @returns Promise
     */
    async getDocumentWithChildren(ref: admin.firestore.DocumentReference): Promise<DocumentItem> {
        const collections = await ref.listCollections();
        return new DocumentItem(ref.id, ref, collections.length === 0);
    }

    /**
     * Increase the paging limit for the given collection path a refresh the view to show more items.
     * @param  {string} path
     */
    async showMoreItems(path: string) {
        const defaultLimit = vscode.workspace.getConfiguration().get("firestore-explorer.pagingLimit") as number;
        const newLimit = (this._paging[path] ?? defaultLimit) + defaultLimit;
        this._paging[path] = newLimit;
        this.refresh();
    }
}