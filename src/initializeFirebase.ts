import * as admin from "firebase-admin";
import * as vscode from "vscode";

/**
 * Attempts to initialize firebase and prompts the user to check settings in case of failure
 */
export async function initializeFirebase(
  context: vscode.ExtensionContext,
): Promise<boolean> {
  const filePath = (await vscode.workspace
    .getConfiguration("firestore-explorer")
    .get("adminSdkKey")) as string;

  try {
    if (filePath === "") {
      vscode.window
        .showWarningMessage(
          "You need to specify the path to your Firebase SDK Key.",
          "Open configuration",
        )
        .then(async (string) => {
          if (string === "Open configuration") {
            await vscode.commands.executeCommand(
              "workbench.action.openSettings",
              "firestore-explorer.adminSdkKey",
            );
          }
        });

      throw new Error("Not specified");
    }

    if (admin.apps.length === 0) {
      const app = admin.initializeApp({
        credential: admin.credential.cert(require(filePath)),
      });
    }

    return true;
  } catch (e) {
    console.log(e);
  }

  return false;
}
