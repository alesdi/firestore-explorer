// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import copyPath from "./commands/copyPath";
import init from "./commands/init";
import openPath from "./commands/openPath";
import openServiceAccountSettings from "./commands/openServiceAccountSettings";
import { scheme } from "./constants";
import { DocumentFileSystemProvider } from "./editor/DocumentFileSystemProvider";
import ExplorerDataProvider from "./explorer/ExplorerDataProvider";
import initializeFirestore from "./utilities/initializeFirestore";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
  const explorerDataProvider = new ExplorerDataProvider();

  const explorerView = vscode.window.createTreeView('firestore-explorer-view', {
    treeDataProvider: explorerDataProvider,
  });

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "firestore-explorer.setServiceAccountKeyPath",
      openServiceAccountSettings
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "firestore-explorer.init",
      init
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "firestore-explorer.openPath",
      openPath
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "firestore-explorer.refreshExplorer",
      () => explorerDataProvider.refresh()
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "firestore-explorer.copyPath",
      copyPath
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "firestore-explorer.showMoreItems",
      (path: string) => explorerDataProvider.showMoreItems(path)
    )
  );
  context.subscriptions.push(explorerView);

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(
      () => {
        initializeFirestore(true);
        explorerDataProvider.refresh();
      }
    )
  );

  context.subscriptions.push(vscode.workspace.registerFileSystemProvider(scheme, new DocumentFileSystemProvider(), { isCaseSensitive: true }));
}

// this method is called when your extension is deactivated
export function deactivate() { }
