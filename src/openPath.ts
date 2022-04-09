import * as vscode from "vscode";

/**
 * Attempts to open a generic Firestore path supplied by the user
 */

export async function openPath(context: vscode.ExtensionContext) {
  let input = await vscode.window.showInputBox({
    placeHolder: "Firestore Path",
  });
  if (input) {
    const parts = input.split("/");
    if (parts.length < 2) {
      // TODO: Invalid path error
      return;
    }

    if (parts[0] !== "") {
      // TODO: Invalid path. Must start with '/'.
      return;
    }

    // Clean path
    if (parts[parts.length - 1] === '') {
      parts.pop();
    }
    // TODO: Perform additional cleaning
    const cleanPath = parts.join('/');

    if (parts.length % 2) {
      // The path refers to a document
      // TODO: Implement
    } else {
      // The path refers to a collection
      // TODO: Implement
    }
  }
}
