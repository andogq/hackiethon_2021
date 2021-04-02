# Setup Instructions
1. Install NodeJS and npm
2. Install `firebase-tools` with `sudo npm install -g firebase-tools`
3. Login with `firebase login`
4. Select the project with `firebase use hackiethon-2021`
5. Go to https://console.firebase.google.com, select the project, go to settings then the `Service accounts` tab, press `Generate new private key` and save it to the root of the directory as `service_account.json`.
6. Run `firebase emulators:start` and go to http://localhost:5000 to view the project

# Folder Layout
 - `/functions`
Contains snippets of code that will be run on the server, as self contained functions.
 - `/public`
Contains code that will be served to the client directly (static content like images, stylesheets ect).
 - `/scripts`
Helper scripts for us during development, for things like initialising the database and other common tasks.

# Features
 - Specify kinds of exercises
 - Scoreboards
    - Private scoreboards/teams
 - Collaboration
    - See when others have done an exercise
    - Link and do exercise with others
    - Challenges/bidding
 - Daily streaks
 - Teams
    - Helping the team rather than competing
 - Notification management
    - Snooze
    - Schedule
    - Calendar integration (advanced)
 - Simplicity
 - Photo evidence of activity (selfie)
    - Extra points for verification
 - Animations demonstrating exercise

# Todo
 - [ ] Account management
 - [ ] Random exercise notification
 - [ ] Points
 - [ ] Notification management
 - [ ] Scoreboards
 - [ ] Teams

# Glossary
 - Firebase: A collection of tools and services that allows for applications to be quickly built
 - Firestore: The databse that we'll be using for the project
 - Cloud Functions: Snippets of code that will be run on the server
 - Emulator: An instance of Firebase that runs locally, doesn't have any usage restrictions and is ideal for development

# Notes
 - Few things to not commit by accident: `node_modules` folder, any log files `*.log` and most importantly `service_account.json` (pretty much a password to certain parts of your Google account, be careful)