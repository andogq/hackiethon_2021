import * as dom from "/js/dom.js";

let db;
let exercises = {};
let preferences = {};
let notification_timer;

function trigger_exercise() {
    let exercise_names = Object.keys(exercises);

    if (exercise_names.length == preferences.exclude_exercises.length && exercise_names > 0) {
        console.error("All exercises have been excluded");
    } else if (exercise_names.length > 0) {
        let exercise_name;
        do {
            exercise_name = exercise_names[Math.floor(Math.random() * exercise_names.length)];
        } while (preferences.exclude_exercises.length > 0 && preferences.exclude_exercises.indexOf(exercise_name) != -1);

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
    if (notification_timer) clearTimeout(notification_timer);

    // Work out if the timer can run now
    let timer_length = preferences.notification_interval * 60 * 1000;

    let date = new Date();
    let day = date.getDay();
    let milliseconds_today = (((((date.getHours() * 60) + date.getMinutes()) * 60) + date.getSeconds()) * 1000) + date.getMilliseconds();

    let milliseconds_in_day = 24 * 60 * 60 * 1000;

    // If at the end of the day/week, move to the next day/week
    let goal_milliseconds = milliseconds_today + timer_length;
    if (goal_milliseconds >= milliseconds_in_day) {
        goal_milliseconds -= milliseconds_in_day;
        day = day == 6 ? 0 : day + 1;
    }

    let allowed_day = preferences.notification_days.indexOf(day) != -1;
    let allowed_time = false;

    preferences.notification_hours.forEach(({start, end}) => {
        allowed_time = allowed_time || (goal_milliseconds >= start && goal_milliseconds < end);
    });


    if (allowed_time && allowed_day) {
        // Begin the timer for the new notification
        console.log(`Starting timer for ${preferences.notification_interval} mins`);
        if (preferences.notification_interval) notification_timer = setTimeout(() => {
            // Send the notification
            navigator.serviceWorker.controller.postMessage({
                command: "notify",
                parameters: {
                    title: "Exercise time"
                }
            });

            // Start the next timer
            start_timer();
        }, timer_length);
    } else {
        // Timer wasn't allowed, work out when the next one will be
        let next_day = day;
        let counter = 0;
        while (preferences.notification_days.indexOf(next_day) == -1 && !allowed_day && counter < 7) {
            next_day = next_day == 6 ? 0 : next_day + 1;
            counter++;
        }

        if (next_day == day && !allowed_day) {
            console.error("No allowed day found");
        } else {
            let next_time = Infinity;
            let earliest_time = allowed_day ? milliseconds_today : 0;

            do {
                preferences.notification_hours.forEach(({start}) => {
                    if (start < next_time && earliest_time < start) next_time = start;
                });

                if (next_time == Infinity) {
                    // No more times on the current day, move to the next and remove the time restriction
                    next_day = next_day == 6 ? 0 : next_day + 1;
                    earliest_time = 0;
                }
            } while (next_time == Infinity);

            // Find the milliseconds between now and the next time
            let millisecond_difference = 0;

            let difference_days = next_day - day;
            if (difference_days < 0) difference_days += 7;
            millisecond_difference += difference_days * 24 * 60 * 60 * 1000;

            millisecond_difference += next_time - milliseconds_today;
            
            // Set a timer to start a timer for a notification at that time;
            notification_timer = setTimeout(start_timer, millisecond_difference);

            {
                let diff_days = Math.floor(millisecond_difference / 1000 / 60 / 60 / 24);
                millisecond_difference %= 1000 * 60 * 60 * 24;
                let diff_hours = Math.floor(millisecond_difference / 1000 / 60 / 60);
                millisecond_difference %= 1000 * 60 * 60;
                let diff_minutes = Math.floor(millisecond_difference / 1000 / 60);
                millisecond_difference %= 1000 * 60;
                let diff_seconds = Math.floor(millisecond_difference / 1000);
                millisecond_difference %= 1000;

                console.log(`Timer will start in ${diff_days} days, ${diff_hours} hours, ${diff_minutes} minutes and ${diff_seconds} seconds`);
            }
        }
    }
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
                notification_days: [1, 2, 3, 4, 5],
                exclude_exercises: [
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

        let exclude_exercises = [...dom.el.container_exclude_exercises.getElementsByTagName("input")].reduce((excluded, el) => {
            if (el.checked) {
                excluded.push(el.name);
            }
            return excluded;
        }, []);
    
        // Very bad, fix later
        let user = firebase.auth().currentUser;
        if (user) {
            Promise.all([
                user.updateProfile({
                    displayName: name
                }),
                db.collection("users").doc(user.uid).update({exclude_exercises})
            ]).then(() => {
                console.log("Update Successful");
                update_user_name();
            }).catch(e => {
                console.error(e);
            });
        }
    });

    console.log(promises);

    return Promise.all(promises);
}

document.addEventListener("DOMContentLoaded", () => {
    init().then(() => {
        // All data loaded
        console.log("All data loaded");

        firebase.auth().onAuthStateChanged(user => {
            if (user) {
                console.log("User signed in");

                dom.hide("container_landing");
                dom.show("container_app");
        
                update_user_name();

                // Load user data
                let doc_ref = db.collection("users").doc(user.uid);
                doc_ref.get().then((doc) => {
                    if (doc.exists) {
                        preferences = doc.data();
                        console.log("Successfully loaded user preferences");

                        // Populate the update profile form
                        let exercise_preference = {};
                        Object.keys(exercises).forEach(exercise => {
                            exercise_preference[exercise] = {
                                name: exercises[exercise].name,
                                excluded: preferences.exclude_exercises.indexOf(exercise) != -1
                            }
                        });
                        dom.update.container_exclude_exercises(exercise_preference);

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

                dom.show("container_landing");
                dom.hide("container_app");

                // Always redirect back to root if logged out
                if (location.pathname != "/") history.replaceState(null, "", "/");
            }
        });
    });
});