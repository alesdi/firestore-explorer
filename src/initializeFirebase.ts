import * as admin from "firebase-admin";
import * as vscode from "vscode";
import openServiceAccountSettings from "./openServiceAccountSettings";

/**
 * Attempts to initialize firebase and prompts the user to check settings in case of failure
 */
export async function initializeFirebase(
  context?: vscode.ExtensionContext,
): Promise<boolean> {
  const filePath = (await vscode.workspace
    .getConfiguration("firestore-explorer")
    .get("serviceAccountKeyPath")) as string;

  try {
    if (filePath === "") {
      vscode.window
        .showWarningMessage(
          "You need to specify the path to your Firebase Service Account Key. [How to get my Service Account Key?](https://firebase.google.com/docs/admin/setup#initialize_the_sdk)",
          "Open configuration",
        )
        .then(async (string) => {
          if (string === "Open configuration") {
            await openServiceAccountSettings();
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
