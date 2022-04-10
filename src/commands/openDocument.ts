import * as admin from "firebase-admin";
import * as vscode from "vscode";
import { scheme } from "../constants";
import path = require("path");

/**
 * Open a Firestore document in the editor.
 * @param  {admin.firestore.DocumentReference} documentReference
 * @returns Promise
 */
export async function openDocument(
  documentReference: admin.firestore.DocumentReference,
): Promise<void> {
  const doc = await vscode.workspace.openTextDocument(vscode.Uri.parse(scheme + ":/" + documentReference.path));
  await vscode.window.showTextDocument(doc, { preview: false, preserveFocus: true });
  await vscode.languages.setTextDocumentLanguage(doc, "json");
}
