import * as dom from "/js/dom.js";

let db;
let exercises = {};
let preferences = {};
let notification_timer;

function trigger_exercise() {
    let exercise_names = Object.keys(exercises);

    if (exercise_names.length == preferences.exclude_exercise.length && exercise_names > 0) {
        console.error("All exercises have been excluded");
    } else if (exercise_names.length > 0) {
        let exercise_name;
        do {
            exercise_name = exercise_names[Math.floor(Math.random() * exercise_names.length)];
        } while (preferences.exclude_exercise.length > 0 && preferences.exclude_exercise.indexOf(exercise_name) != -1);

        let exercise = exercises[exercise_name];
        dom.update.container_output(exercise.name, exercise.description);
    } else console.error("No exercises loaded");
}

function update_user_name() {
    let user = firebase.auth().currentUser;

    if (user) {
        dom.update.span_name(user.displayName || "User");
    }
}

function start_timer() {
    // Stop the old notification
    if (notification_timer) clearInterval(notification_timer);

    // Begin the timer for the new notification
    console.log(`Starting timer for ${preferences.notification_interval} mins`);
    if (preferences.notification_interval) notification_timer = setInterval(() => {
        navigator.serviceWorker.controller.postMessage({
            command: "notify",
            parameters: {
                title: "Exercise time"
            }
        });
    }, preferences.notification_interval * 60 * 1000);
}

function init() {
    db = firebase.firestore();

    let promises = [];

    // Listener for new exercise additions
    promises.push(new Promise(resolve => {
        db.collection("exercises").onSnapshot(snapshot => {
            exercises = {};
            snapshot.docs.forEach(doc => {
                exercises[doc.id] = doc.data();
            });
            console.log("Exercises updated");

            resolve();
        });
    }));

    // Setup service worker
    if ('serviceWorker' in navigator) {
        promises.push(navigator.serviceWorker.register("/sw.js", {scope: "/"}).then(registration => {
            console.log("Service worker registered");
        }).catch(e => {
            console.error(e);
        }));
    
        navigator.serviceWorker.addEventListener("message", e => {
            if (e.data.command == "trigger_exercise") trigger_exercise();
        });
    }

    // Setup notifications
    promises.push(new Promise(resolve => {
        // TODO: Make this more robust incase the user rejects the permission
        if (Notification.permission == "granted") resolve();
        else {
            dom.update.container_alert("Notification permissions are required", "In order for us to send you reminders, we need permission to send you notifications.", () => {
                Notification.requestPermission().then(permission => {
                    if (permission == "granted") resolve();
                    else {
                        console.error("Notifications are required");
                    }
                });
            });
        }
    }));
    
    // Event listners attached to different elements
    dom.el.button_register.addEventListener("click", () => {
        let email = dom.el.form_account_details.elements["email"].value;
        let password = dom.el.form_account_details.elements["password"].value;
    
        firebase.auth().createUserWithEmailAndPassword(email, password).then(({user}) => {
            console.log("Registered and signed in successfully");

            // Create preferences for that user
            preferences = {
                notification_interval: 5,
                notification_hours: [
                    {start: 9 * 60 * 60 * 1000, end: 11 * 60 * 60 * 1000},
                    {start: 12 * 60 * 60 * 1000, end: 15 * 60 * 60 * 1000},
                    {start: 16 * 60 * 60 * 1000, end: 17 * 60 * 60 * 1000},
                ],
                notification_days: [0, 1, 2, 3, 4],
                exclude_exercise: [
                    "star_jump"
                ]
            };

            if (user) db.collection("users").doc(user.uid).set(preferences).then(() => {
                console.log("Successfully created user preferences");
            }).catch(e => {
                console.error(e);
            });
        }).catch(error => {
            console.error(error);
        });
    });
    
    dom.el.button_sign_in.addEventListener("click", () => {
        let email = dom.el.form_account_details.elements["email"].value;
        let password = dom.el.form_account_details.elements["password"].value;
    
        firebase.auth().signInWithEmailAndPassword(email, password).then(() => {
            console.log("Signed in successfully");
        }).catch(error => {
            console.error(error);
        });
    });
    
    dom.el.button_sign_out.addEventListener("click", () => {
        firebase.auth().signOut().then(() => {
            console.log("Signed out successfully");

            // Reload the page
            location.reload();
        }).catch(error => {
            console.error(error);
        });
    });
    
    dom.el.button_update_profile.addEventListener("click", () => {
        let name = dom.el.form_update_profile.elements["name"].value;
    
        // Very bad, fix later
        let user = firebase.auth().currentUser;
        if (user) {
            user.updateProfile({
                displayName: name
            }).then(() => {
                console.log("Update Successful");
                update_user_name();
            }).catch(e => {
                console.error(e);
            });
        }
    });

    return Promise.all(promises);
}

document.addEventListener("DOMContentLoaded", () => {
    init().then(() => {
        // All data loaded
        console.log("All data loaded");

        firebase.auth().onAuthStateChanged(user => {
            if (user) {
                console.log("User signed in");

                dom.hide("container_sign_in");
                dom.show("container_account_manager");
        
                update_user_name();

                // Load user data
                let doc_ref = db.collection("users").doc(user.uid);
                doc_ref.get().then((doc) => {
                    if (doc.exists) {
                        preferences = doc.data();
                        console.log("Successfully loaded user preferences");

                        start_timer();
                    } else console.error("Problem loading user preferences")
                }).catch(console.error);

                // If at /trigger_exercise, trigger an exercise then reset back to root
                if (location.pathname == "/trigger_exercise") {
                    trigger_exercise();

                    history.replaceState(null, "", "/");
                }
            } else {
                console.log("User signed out");

                dom.show("container_sign_in");
                dom.hide("container_account_manager");

                // Always redirect back to root if logged out
                if (location.pathname != "/") history.replaceState(null, "", "/");
            }
        });
    });
});