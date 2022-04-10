import * as vscode from "vscode";
/**
 * Open the workspace settings at the service account key path.
 * @returns Promise
 */
export default async function openServiceAccountSettings(): Promise<void> {
    await vscode.commands.executeCommand('workbench.action.openSettings', 'firestore-explorer.serviceAccountKeyPath');
}