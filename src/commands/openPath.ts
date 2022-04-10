import * as admin from "firebase-admin";
import * as vscode from "vscode";
import { initializeFirebase } from "../initializeFirebase";
import { openDocument } from "./openDocument";

/**
 * Attempts to open a generic Firestore path supplied by the user
 */

export default async function openPath(path?: string) {
  path = path ?? await vscode.window.showInputBox({
    placeHolder: "Firestore Path",
  });
  if (path !== undefined) {
    await initializeFirebase();
    const firebase = admin.app().firestore();
    const parts = path.split("/");

    try {
      if (parts.length % 2 === 0) {
        // The path refers to a document
        const doc = firebase.doc(path);
        openDocument(doc);
      } else {
        // The path refers to a collection
        const collection = firebase.collection(path);
      }
    } catch (e) {
      console.error(e);
      throw new Error("Invalid path");
    }
  }
}
