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
    private _orderBy: {
        [key: string]: {
            field: string | undefined,
            direction: 'asc' | 'desc'
        }
    } = {};

    readonly onDidChangeTreeData: vscode.Event<Item | undefined> = this
        ._onDidChangeTreeData.event;

    refresh(): void {
        this._onDidChangeTreeData.fire(undefined);
    }

    async getTreeItem(element: Item): Promise<vscode.TreeItem> {
        if (element instanceof CollectionItem) {
            return this.getCollectionWithSize(element);
        } else if (element instanceof DocumentItem) {
            return this.getDocumentWithSize(element);
        } else {
            return element;
        }
    }

    async getParent(element: Item): Promise<Item | undefined> {
        if (element instanceof DocumentItem) {
            return new CollectionItem(element.reference.parent.id, element.reference.parent);
        } else if (element instanceof CollectionItem) {
            if (element.reference.parent !== null) {
                return new DocumentItem(element.reference.parent.id, element.reference.parent);
            }
        }
    }

    async getChildren(element?: DocumentItem | CollectionItem): Promise<Item[] | undefined> {
        const firestore = await initializeFirestore();
        if (!element) {
            const refs = await firestore.listCollections();

            return refs.map(ref => new CollectionItem(
                ref.id,
                ref,
                {
                    fieldName: this._orderBy[ref.path]?.field ?? 'id',
                    direction: this._orderBy[ref.path]?.direction ?? 'asc',
                }
            ));
        } else if (element instanceof DocumentItem) {
            const refs = await element.reference.listCollections();

            return refs.map(ref => new CollectionItem(ref.id,
                ref,
                {
                    fieldName: this._orderBy[ref.path]?.field ?? 'id',
                    direction: this._orderBy[ref.path]?.direction ?? 'asc',
                }
            ));
        } else if (element instanceof CollectionItem) {
            const limit = this._paging[element.reference.path] ?? vscode.workspace.getConfiguration().get("firestore-explorer.pagingLimit");

            console.log(this._orderBy[element.reference.path]?.field ?? admin.firestore.FieldPath.documentId());
            const snapshots = await element.reference
                .limit(limit + 1)
                .orderBy(
                    this._orderBy[element.reference.path]?.field ?? admin.firestore.FieldPath.documentId(),
                    this._orderBy[element.reference.path]?.direction ?? 'asc',
                )
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
    async getCollectionWithSize(element: CollectionItem): Promise<CollectionItem> {
        const docs = await element.reference.limit(1).get();
        return element.withSize(docs.size);
    }

    /**
     * Retrieves children for the given document and returns the same document with the isEmpty flag set.
     * @param  {admin.firestore.DocumentReference} ref
     * @returns Promise
     */
    async getDocumentWithSize(element: DocumentItem): Promise<DocumentItem> {
        const collections = await element.reference.listCollections();
        return element.withSize(collections.length);
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

    async orderBy(path: string, field: string | undefined, direction: admin.firestore.OrderByDirection) {
        this._orderBy[path] = {
            field,
            direction
        };
        this.refresh();
    }
}