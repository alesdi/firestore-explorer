# Firestore Explorer

A simple Visual Studio Code Extension for listing, viewing and editing Firebase Firestore Database collections and documents using JSON syntax.

This is a work in progress. Many critical features are still missing and unexpected behavior may occur. Contributions are welcome.

**Be careful:** this is not an official Firebase product. This extension relies on the [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup) and its usage will generate reads and writes that may impact your Firebase billing.

![Demo](https://user-images.githubusercontent.com/54476193/162635495-b9a7d369-a090-4aa8-a874-5ff1a2e45738.gif)

## How to use

To use this extension you will need to generate a Firebase service account from your Firebase console, as explained in the [Firebase Admin SDK documentation](https://firebase.google.com/docs/admin/setup#set-up-project-and-service-account).

Provide a path to the service account JSON file in the `serviceAccountKeyPath` setting. You can also use the "Firestore Explorer: Initialize" command from the Command Palette to quickly reach the setting field.

## Features

After configuring the extension with your service account, open the Firestore Explorer View in the activity bar to:

- navigate all the collections and documents of your project (items will be loaded only when needed and paged to minimize the number of API requests);

- sort documents in a collection by a specified field and direction;

- view and edit the content of any document as a simple JSON file, taking advantage of the full power of vscode editor. Just save the file it to immediately update the document in the database.

## Extension Settings

- `serviceAccountKeyPath`: path to the service account JSON file
- `projectId`: the project ID of your Firebase project

## Known Issues

- Special field types such as `geopoint` and `timestamp` are not correctly handled due to the JSON conversion.

- Creating and deleting documents and collections is not supported yet.

- There are no options for filtering documents.
