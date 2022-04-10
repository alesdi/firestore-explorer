import * as admin from "firebase-admin";
import * as vscode from "vscode";
import { scheme } from "../constants";
import path = require("path");

/**
 * TODO: To be implemented. This is just placeholder code.
 */

export async function openDocument(
  documentReference: admin.firestore.DocumentReference,
) {
  const doc = await vscode.workspace.openTextDocument(vscode.Uri.parse(scheme + "://documents/" + documentReference.path));
  await vscode.window.showTextDocument(doc, { preview: false });
  await vscode.languages.setTextDocumentLanguage(doc, "json");
}
