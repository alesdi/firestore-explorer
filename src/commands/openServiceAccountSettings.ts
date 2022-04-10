import * as vscode from "vscode";

export default async function openServiceAccountSettings(): Promise<void> {
    await vscode.commands.executeCommand('workbench.action.openSettings', 'firestore-explorer.serviceAccountKeyPath');
}