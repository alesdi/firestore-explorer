import * as vscode from "vscode";
import { Item } from "../explorer/items";
/**
 * Copy the Tree View item path to the clipboard.
 * @param  {Item} item
 */
export default async function copyPath(item: Item) {
    vscode.env.clipboard.writeText(item.reference.path);
}