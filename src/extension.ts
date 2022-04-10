// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import copyPath from "./commands/copyPath";
import init from "./commands/init";
import openPath from "./commands/openPath";
import openServiceAccountSettings from "./commands/openServiceAccountSettings";
import { scheme } from "./constants";
import { DocumentFileSystemProvider } from "./editor/DocumentFileSystemProvider";
import ExplorerViewProvider from "./explorer/ExplorerViewProvider";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
  console.log(
    'Active',
  );

  const explorerViewProvider = new ExplorerViewProvider();

  const explorerView = vscode.window.createTreeView('firestore-explorer-view', {
    treeDataProvider: explorerViewProvider,
  });

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
      "firestore-explorer.init",
      () => {
        init();
      },
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "firestore-explorer.openPath",
      async (path: string) => {
        await openPath(path);
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "firestore-explorer.refreshExplorer",
      () => {
        explorerViewProvider.refresh();
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "firestore-explorer.copyPath",
      (item) => {
        copyPath(item);
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "firestore-explorer.showMoreItems",
      (path) => {
        explorerViewProvider.showMoreItems(path);
      }
    )
  );
  context.subscriptions.push(explorerView);

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(
      () => {
        vscode.commands.executeCommand('firestore-explorer.refreshExplorer');
      }
    )
  );

  context.subscriptions.push(vscode.workspace.registerFileSystemProvider(scheme, new DocumentFileSystemProvider(), { isCaseSensitive: true }));
}

// this method is called when your extension is deactivated
export function deactivate() { }
