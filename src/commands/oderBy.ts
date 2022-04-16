import * as vscode from "vscode";
import ExplorerDataProvider from "../explorer/ExplorerDataProvider";
import { Item } from "../explorer/items";


export default async function orderBy(item: Item, explorerDataProvider: ExplorerDataProvider) {
    const fieldString = await vscode.window.showInputBox({
        prompt: "Field name to order by",
        title: "Order by",
        placeHolder: "Field path",
    });

    const field: string | undefined = (fieldString === undefined || fieldString === "") ? undefined : fieldString;

    if (field === undefined) {
        return;
    }

    const direction = (await vscode.window.showQuickPick(
        [
            { label: "Ascending", picked: true },
            { label: "Descending" },
        ],
        {
            placeHolder: "Direction",
            title: "Order by",
        }
    ) as { label: string; picked: boolean }).label === 'Descending'
        ? 'desc'
        : 'asc';

    explorerDataProvider.orderBy(item.reference.path, field, direction);
    explorerDataProvider.refresh();
}