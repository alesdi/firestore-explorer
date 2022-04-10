import * as vscode from "vscode";
import initializeFirestore from "../utilities/initializeFirestore";
import { openDocument } from "./openDocument";
/**
 * Open a generic Firestore path. If the path is a document, it will be opened in the editor.
 * Collection paths are not currently supported.
 * @param  {string} path?
 */
export default async function openPath(path?: string): Promise<void> {
  path = path ?? await vscode.window.showInputBox({
    placeHolder: "Firestore Path",
  });
  if (path !== undefined) {
    const firestore = await initializeFirestore();

    try {
      const parts = path.split("/");
      if (parts.length % 2 === 0) {
        // The path refers to a document
        const doc = firestore.doc(path);
        openDocument(doc);
      } else {
        // The path refers to a collection
        vscode.window.showErrorMessage("Only document paths are supported");
        // TODO: handle collections (e.g. reveal in the tree view)
      }
    } catch (e) {
      console.error(e);
      throw new Error("Invalid path");
    }
  }
}
