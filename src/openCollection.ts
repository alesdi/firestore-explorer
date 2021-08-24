import * as admin from "firebase-admin";
import * as vscode from "vscode";
import { initializeFirebase } from "./initializeFirebase";

/**
 * Open a webview that shows the contents of a collection
 */
export async function openCollection(
  context: vscode.ExtensionContext,
  collectionPath: string,
) {
  try {
    await initializeFirebase(context);
    const firestore = admin.app().firestore();

    const collectionName = collectionPath.split("/").pop()!;

    const collection = firestore.collection(collectionPath);

    // TODO: Handle inexistent collections

    const panel = vscode.window.createWebviewPanel(
      "firestore-explorer.collectionView",
      "Collection: " + collectionName,
      vscode.ViewColumn.One,
      {}, // Webview options. More on these later.
    );

    panel.webview.html = await renderCollection(collectionName, collection);
  } catch (e) {
    console.log(e);
  }
}

async function renderCollection(
  name: string,
  reference: FirebaseFirestore.CollectionReference,
): Promise<string> {
  // TODO: Add style and advanced querying and paging

  const documents = await reference.limit(10).get();

  const items: CollectionItem[] = [];

  documents.forEach((doc) => {
    items.push({ id: doc.id });
  });

  let code =
    `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>` +
    name +
    `</title>
  </head>
  <body>
    <h1>` +
    name +
    `</h1>
    <ul>`;

  items.forEach((item) => {
    code += "<li>" + item.id + "</li>";
  });

  code += `</ul>
  </body>`;

  return code;
}

export interface CollectionItem {
  id: string;
}
