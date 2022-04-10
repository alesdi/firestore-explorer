import * as vscode from "vscode";
import { Item } from "../explorer/items";

export default async function copyPath(item: Item) {
    vscode.env.clipboard.writeText(item.reference.path);
}