// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as admin from "firebase-admin";
import * as vscode from "vscode";
import DocumentsListProvider from "./explorer/DocumentsListProvider";
import { openDocument } from "./openDocument";
import { openPath } from "./openPath";
import openServiceAccountSettings from "./openServiceAccountSettings";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
  console.log(
    'Active',
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "firestore-explorer.openPath",
      () => openPath(context),
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "firestore-explorer.setServiceAccountKeyPath",
      () => {
        openServiceAccountSettings();
      },
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "firestore-explorer.openDocument",
      (reference: admin.firestore.DocumentReference) => {
        openDocument(context, reference);
      }
    )
  );

  context.subscriptions.push(
    vscode.window.registerTreeDataProvider('documentsList', new DocumentsListProvider())
  );
}

// this method is called when your extension is deactivated
export function deactivate() { }
