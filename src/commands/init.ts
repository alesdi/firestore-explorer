import openServiceAccountSettings from "./openServiceAccountSettings";
/**
 * Open the workspace settings at the service account key path.
 * @returns Promise
 */
export default async function init(): Promise<void> {
    // TODO: Find a better first-time configuration flow
    await openServiceAccountSettings();
}