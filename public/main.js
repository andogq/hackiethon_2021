const db = firebase.firestore();

let exercises = [];

// Listener for new exercise additions
db.collection("exercises").onSnapshot(snapshot => {
    exercises = snapshot.docs.map(exercise => exercise.data());
    console.log("Exercises updated");
});

// Generates a random exercise from the database
function random_exercise() {
    return exercises[Math.floor(Math.random() * exercises.length)];
}

function update_user_name() {
    let user = firebase.auth().currentUser;

    if (user) {
        el.user_name.innerText = user.displayName || "User";
    }
}

// Stores elements on the page
const el = {
    output: document.getElementById("output"),
    account_form: document.getElementById("account"),
    register_button: document.getElementById("register"),
    sign_in_button: document.getElementById("sign_in"),
    sign_out_botton: document.getElementById("sign_out"),
    signed_in: document.getElementById("signed_in"),
    signed_out: document.getElementById("signed_out"),
    update_profile: document.getElementById("update_profile"),
    update_profile_button: document.getElementById("update_profile_button"),
    user_name: document.getElementById("user_name")
}

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register("/sw.js").then(registration => {
        console.log("Service worker registered");
    }).catch(e => {
        console.error(e);
    });

    navigator.serviceWorker.addEventListener("message", e => {
        console.log(`Message from service worker: ${JSON.stringify(e.data)}`);
        if (e.data.command == "trigger_exercise") {
            el.output.innerHTML = "";

            let exercise = random_exercise();
        
            let header = document.createElement("h3");
            header.innerText = exercise.name;
            el.output.appendChild(header);
        
            let description = document.createElement("p");
            description.innerText = exercise.description;
            el.output.appendChild(description);
        }
    });
}

firebase.auth().onAuthStateChanged(user => {
    if (user) {
        console.log("User signed in");
        el.signed_in.style.display = "";
        el.signed_out.style.display = "none";

        update_user_name();
    } else {
        console.log("User signed out");
        el.signed_in.style.display = "none";
        el.signed_out.style.display = "";
    }
});

el.register_button.addEventListener("click", () => {
    let email = el.account_form.elements["email"].value;
    let password = el.account_form.elements["password"].value;

    firebase.auth().createUserWithEmailAndPassword(email, password).then(() => {
        console.log("Registered and signed in successfully");
    }).catch(error => {
        console.error(error);
    });
});

el.sign_in_button.addEventListener("click", () => {
    let email = el.account_form.elements["email"].value;
    let password = el.account_form.elements["password"].value;

    firebase.auth().signInWithEmailAndPassword(email, password).then(() => {
        console.log("Signed in successfully");
    }).catch(error => {
        console.error(error);
    });
});

el.sign_out_botton.addEventListener("click", () => {
    firebase.auth().signOut().then(() => {
        console.log("Signed out successfully");
    }).catch(error => {
        console.error(error);
    });
});

el.update_profile_button.addEventListener("click", () => {
    let name = el.update_profile.elements["name"].value;

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