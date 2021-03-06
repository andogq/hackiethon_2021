import * as dom from "/dom.js";

let db;
let user;
let exercises = {};
let preferences = {};
let statistics = {};
let notification_timer;
let exercise_timer;

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
        
        let timer_el = dom.update.container_exercise_popup({
            name: `${Math.floor(Math.random() * (exercise.max - exercise.min + 1) + exercise.min)} x ${exercise.name}s`,
            description: exercise.description
        },
        () => {
            console.log("Exercise complete");

            statistics.points += 1;
            statistics.done_today += 1;

            dom.update.container_user_statistics(statistics.points, statistics.done_today, statistics.streak);

            db.collection("statistics").doc(user.uid).update(statistics);

            if (exercise_timer) clearTimeout(exercise_timer);

            start_timer();
        },
        () => {
            console.log("Exercise skipped");

            statistics.skipped_today++;

            db.collection("statistics").doc(user.uid).update(statistics);

            if (exercise_timer) clearTimeout(exercise_timer);

            start_timer();
        });

        popup_timer(timer_el, 120, () => {
            dom.hide("container_exercise_popup_blur");

            console.log("Exercise missed");

            statistics.skipped_today++;

            db.collection("statistics").doc(user.uid).update(statistics);

            start_timer();
        });
    } else console.error("No exercises loaded");
}

function popup_timer(timer_el, time, end_callback) {
    time--;

    if (time < 0) {
        exercise_timer = undefined;

        end_callback();
    } else {
        let min = String(Math.floor(time / 60));
        min = min.length == 1 ? `0${min}` : min;
    
        let sec = String(time % 60);
        sec = sec.length == 1 ? `0${sec}` : sec;
        
        timer_el.innerText = `${min}:${sec}`;

        exercise_timer = setTimeout(popup_timer, 1000, timer_el, time, end_callback);
    }
}

function update_user_name() {
    if (user) {
        db.collection("statistics").doc(user.uid).get().then(doc => {
            dom.update.span_name(doc.data().username);
        });
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
            trigger_exercise();

            // Send the notification
            navigator.serviceWorker.controller.postMessage({
                command: "notify",
                parameters: {
                    title: "Exercise time",
                    body: "Return to the tab and complete the exercise, be quick!"
                }
            });
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
    
        firebase.auth().createUserWithEmailAndPassword(email, password).then((credential) => {
            console.log("Registered and signed in successfully");

            let new_user = credential.user;

            // Create preferences for that user
            preferences = {
                notification_interval: 30,
                notification_hours: [
                    {start: 9 * 60 * 60 * 1000, end: 15 * 60 * 60 * 1000}
                ],
                notification_days: [1, 2, 3, 4, 5],
                exclude_exercises: []
            };

            // Create statistics for that user
            statistics = {
                points: 0,
                done_today: 0,
                skipped_today: 0,
                streak: 0,
                team_id: "",
                username: "Unnamed User"
            }

            if (new_user) {
                Promise.all([
                    db.collection("statistics").doc(new_user.uid).set(statistics),
                    db.collection("preferences").doc(new_user.uid).set(preferences)
                ]).then(() => {
                    console.log("Successfully created user preferences and statistics");
                }).catch(e => {
                    console.error(e);
                });
            }
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

            user = undefined;

            // Reload the page
            location.reload();
        }).catch(error => {
            console.error(error);
        });
    });
    
    dom.el.button_update_profile.addEventListener("click", () => {
        let new_preferences = {
            exclude_exercises: [...dom.el.container_exclude_exercises.getElementsByTagName("input")].reduce((excluded, el) => {
                if (el.checked) {
                    excluded.push(el.name);
                }
                return excluded;
            }, []),
            notification_days: [...dom.el.container_notification_days.getElementsByTagName("input")].reduce((days, day, i) => {
                if (day.checked) days.push(i);
                return days;
            }, []),
            notification_hours: [...dom.el.container_notification_hours_list.children].map(child => {
                let [start, end] = child.innerText.split(" - ").map(time => {
                    let [hours, mins] = time.split(":");
                    return (Number(hours) * 60 * 60 * 1000) + (Number(mins) * 60 * 1000);
                });
                return {start, end};
            }),
            notification_interval: Number(dom.el.input_notification_interval.value)
        }

        let new_statistics = {
            username: dom.el.form_update_profile.elements["name"].value,
            team_id: dom.el.input_team_code.value
        }
    
        if (user) {
            Promise.all([
                db.collection("statistics").doc(user.uid).update(new_statistics),
                db.collection("preferences").doc(user.uid).update(new_preferences)
            ]).then(() => {
                console.log("Update Successful");

                // Refresh page
                location.reload();
            }).catch(e => {
                console.error(e);
            });
        }
    });

    dom.el.button_settings.addEventListener("click", () => {
        dom.hide("container_app");
        dom.show("container_settings");
    });

    dom.el.button_back.addEventListener("click", () => {
        dom.hide("container_settings");
        dom.show("container_app");
    });

    dom.el.button_notification_hours_add.addEventListener("click", () => {
        let [el_start, el_end] = dom.el.container_notification_hours_add.getElementsByTagName("input");
        
        let start = el_start.value
        let end = el_end.value;

        if (start != "" && end != "") {
            let el = document.createElement("p");
            el.innerText = `${start} - ${end}`;
            el.addEventListener("click", (e) => {
                e.target.parentElement.removeChild(e.target);
            });
            
            dom.el.container_notification_hours_list.appendChild(el);
        }
    });

    return Promise.all(promises);
}

document.addEventListener("DOMContentLoaded", () => {
    init().then(() => {
        // All data loaded
        console.log("All data loaded");

        firebase.auth().onAuthStateChanged(_user => {
            user = _user;

            if (user) {
                console.log("User signed in");

                dom.hide("container_landing");
                dom.show("container_app");
        
                update_user_name();

                // Load user data
                Promise.all([
                    db.collection("preferences").doc(user.uid).get().then(doc => {
                        if (doc.exists) {
                            preferences = doc.data();

                            // Populate the update profile form
                            let exercise_preference = {};
                            Object.keys(exercises).forEach(exercise => {
                                exercise_preference[exercise] = {
                                    name: exercises[exercise].name,
                                    excluded: preferences.exclude_exercises.indexOf(exercise) != -1
                                }
                            });
                            dom.update.container_exclude_exercises(exercise_preference);   
                            
                            preferences.notification_hours.forEach(period => {
                                let [start, end] = [period.start, period.end].map(p => {
                                    let hours = String(Math.floor(p / (60 * 60 * 1000)));
                                    let mins = String(Math.floor((p % (60 * 60 * 1000)) / (60 * 1000)));

                                    hours = hours.length == 1 ? `0${hours}` : hours;
                                    mins = mins.length == 1 ? `0${mins}` : mins;

                                    return `${hours}:${mins}`
                                });

                                let el = document.createElement("p");
                                el.innerText = `${start} - ${end}`;
                                el.addEventListener("click", (e) => {
                                    e.target.parentElement.removeChild(e.target);
                                });
                                
                                dom.el.container_notification_hours_list.appendChild(el);
                            });

                            let el_day_inputs = [...dom.el.container_notification_days.getElementsByTagName("input")];
                            preferences.notification_days.forEach(day => {
                                el_day_inputs[day].checked = true;
                            });

                            dom.el.input_notification_interval.value = preferences.notification_interval
                        } else console.error("Problem loading user preferences");
                    }),
                    db.collection("statistics").doc(user.uid).get().then(doc => {
                        if (doc.exists) {
                            statistics = doc.data();

                            dom.el.form_update_profile.elements["name"].value = statistics.username;
                            dom.el.input_team_code.value = statistics.team_id;

                            dom.update.container_user_statistics(statistics.points, statistics.done_today, statistics.streak);
                        } else console.error("Problem loading user statistics");
                    })
                ]).then(() => {
                    console.log("Successfully loaded user preferences and statistics");

                    // If at /trigger_exercise, trigger an exercise then reset back to root
                    if (location.pathname == "/trigger_exercise") {
                        trigger_exercise();

                        history.replaceState(null, "", "/");
                    }

                    start_timer();

                    if (statistics.team_id != "") db.collection("statistics").where("team_id", "==", statistics.team_id).onSnapshot(snapshot => {
                        dom.update.container_team_statistics(snapshot.docs.map(doc => doc.data()));
                    });
                }).catch(console.error);
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