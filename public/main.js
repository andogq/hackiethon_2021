import * as dom from "/js/dom.js";

let exercises = [];

function trigger_exercise() {
    if (exercises.length > 0) {
        let exercise = exercises[Math.floor(Math.random() * exercises.length)];
        dom.update.container_output(exercise.name, exercise.description);
    } else console.error("No exercises loaded");
}

function update_user_name() {
    let user = firebase.auth().currentUser;

    if (user) {
        dom.update.span_name(user.displayName || "User");
    }
}

function init() {
    const db = firebase.firestore();

    let promises = [];

    // Listener for new exercise additions
    promises.push(new Promise(resolve => {
        db.collection("exercises").onSnapshot(snapshot => {
            exercises = snapshot.docs.map(exercise => exercise.data());
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
            console.log(`Message from service worker: ${JSON.stringify(e.data)}`);
            if (e.data.command == "trigger_exercise") trigger_exercise();
        });
    }

    // Setup notifications
    promises.push(new Promise(resolve => {
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
    
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            console.log("User signed in");
            dom.show("container_signed_in");
            dom.hide("container_signed_out");
    
            update_user_name();
        } else {
            console.log("User signed out");
            dom.show("container_signed_out");
            dom.hide("container_signed_in");
        }
    });
    
    // Event listners attached to different elements
    dom.el.button_register.addEventListener("click", () => {
        let email = dom.el.form_account.elements["email"].value;
        let password = dom.el.form_account.elements["password"].value;
    
        firebase.auth().createUserWithEmailAndPassword(email, password).then(() => {
            console.log("Registered and signed in successfully");
        }).catch(error => {
            console.error(error);
        });
    });
    
    dom.el.button_sign_in.addEventListener("click", () => {
        let email = dom.el.form_account.elements["email"].value;
        let password = dom.el.form_account.elements["password"].value;
    
        firebase.auth().signInWithEmailAndPassword(email, password).then(() => {
            console.log("Signed in successfully");
        }).catch(error => {
            console.error(error);
        });
    });
    
    dom.el.button_sign_out.addEventListener("click", () => {
        firebase.auth().signOut().then(() => {
            console.log("Signed out successfully");
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
        if (location.pathname == "/trigger_exercise") {
            trigger_exercise();

            history.replaceState(null, "", "/");
        }
    });
});