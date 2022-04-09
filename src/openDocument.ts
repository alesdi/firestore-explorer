import * as fs from "fs/promises";
import * as vscode from "vscode";
import { Document } from "./documentsListProvider";
import { initializeFirebase } from "./initializeFirebase";
import path = require("path");

/**
 * TODO: To be implemented. This is just placeholder code.
 */

export async function openDocument(
  context: vscode.ExtensionContext,
  documentReference: Document
) {
  await initializeFirebase(context);

  const snapshotData = (await documentReference.reference.get()).data();

  if (snapshotData === undefined) {
    console.log(
      "The specified document does not exist. It will be created.`"
    );
    return;
  }

  const data = snapshotData !== undefined ? snapshotData : {};

  let dir = context.globalStorageUri.fsPath;
  let filePath = path.join(dir, "tmp.json");

  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));

  await vscode.commands.executeCommand(
    "vscode.open",
    vscode.Uri.file(filePath)
  );

  if (snapshotData !== undefined) {
    console.log("Document download completed!");
  }
  console.log(
    "Edit the file and save to upload the changes. Close the editor when you are done."
  );

  let lastChangeTime = (await fs.stat(filePath)).mtime;

  const watcher = vscode.workspace.createFileSystemWatcher(filePath, true);

  watcher.onDidChange(async (uri) => {
    if (
      (await fs.stat(filePath)).mtime !== lastChangeTime
    ) {
      console.log("Uploading changes…");
      try {
        const content = await fs.readFile(filePath, "utf8");
        const json = JSON.parse(content);
        try {
          await documentReference.reference.set(json);
          console.log("Changes applied!");
        } catch (error) {
          console.log("Upload error! Could not apply changes.");
        }
        lastChangeTime = (await fs.stat(filePath)).mtime;
      } catch (e) {
        console.error("Invalid content. Check your JSON syntax.");
        return;
      }
    }
  });
}
