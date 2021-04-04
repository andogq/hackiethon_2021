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

# Pages
 - Landing page
    - Registration/login form
    - About the app
 - Home page
    - Scoreboards
    - Teams
 - Settings page
    - Notification management
    - Exercise categories
 - Exercise popup
    - Name of exercise
    - Description/image/video
    - Timer
    - Tick/cross button

# Mentor Feedback
 - Social interaction
 - Holding people accountable
 - Add ideas in video

# Todo
 - [ ] Service worker
   - [x] Push notifications
   - [ ] Offline functionality
   - [x] Updates
 - [x] Account management
 - [x] Random exercise notification
 - [x] Points
 - [x] Notification management
 - [x] Scoreboards
 - [x] Teams
 - [ ] Pretty up notification
 - [x] Add settings page
 - [ ] Working timer on exercise page
 - [ ] Show popup if focused

# Glossary
 - Firebase: A collection of tools and services that allows for applications to be quickly built
 - Firestore: The databse that we'll be using for the project
 - Cloud Functions: Snippets of code that will be run on the server
 - Emulator: An instance of Firebase that runs locally, doesn't have any usage restrictions and is ideal for development

# Notes
 - Few things to not commit by accident: `node_modules` folder, any log files `*.log` and most importantly `service_account.json` (pretty much a password to certain parts of your Google account, be careful)
 - There seems to be a bug with the firestore and auth emulators, where `request.auth` is always null. To work around this, remove any firestore rules that require authentication for the emulator, or do all testing on the production version.