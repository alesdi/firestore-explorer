import openServiceAccountSettings from "./openServiceAccountSettings";

export default async function init(): Promise<void> {
    await openServiceAccountSettings();
}