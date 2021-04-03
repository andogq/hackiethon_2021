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
        el.span_name.innerText = user.displayName || "User";
    }
}

// Stores elements on the page
const el = {
    container_output: document.getElementById("container_output"),
    container_signed_in: document.getElementById("container_signed_in"),
    container_signed_out: document.getElementById("container_signed_out"),

    form_account: document.getElementById("form_account"),
    form_update_profile: document.getElementById("form_update_profile"),

    button_register: document.getElementById("button_register"),
    button_sign_in: document.getElementById("button_sign_in"),
    button_update_profile: document.getElementById("button_update_profile"),
    button_sign_out: document.getElementById("button_sign_out"),

    span_name: document.getElementById("span_name")
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
            el.container_output.innerHTML = "";

            let exercise = random_exercise();
        
            let header = document.createElement("h3");
            header.innerText = exercise.name;
            el.container_output.appendChild(header);
        
            let description = document.createElement("p");
            description.innerText = exercise.description;
            el.container_output.appendChild(description);
        }
    });
}

firebase.auth().onAuthStateChanged(user => {
    if (user) {
        console.log("User signed in");
        el.container_signed_in.style.display = "";
        el.container_signed_out.style.display = "none";

        update_user_name();
    } else {
        console.log("User signed out");
        el.container_signed_in.style.display = "none";
        el.container_signed_out.style.display = "";
    }
});

el.button_register.addEventListener("click", () => {
    let email = el.form_account.elements["email"].value;
    let password = el.form_account.elements["password"].value;

    firebase.auth().createUserWithEmailAndPassword(email, password).then(() => {
        console.log("Registered and signed in successfully");
    }).catch(error => {
        console.error(error);
    });
});

el.button_sign_in.addEventListener("click", () => {
    let email = el.form_account.elements["email"].value;
    let password = el.form_account.elements["password"].value;

    firebase.auth().signInWithEmailAndPassword(email, password).then(() => {
        console.log("Signed in successfully");
    }).catch(error => {
        console.error(error);
    });
});

el.button_sign_out.addEventListener("click", () => {
    firebase.auth().signOut().then(() => {
        console.log("Signed out successfully");
    }).catch(error => {
        console.error(error);
    });
});

el.button_update_profile.addEventListener("click", () => {
    let name = el.form_update_profile.elements["name"].value;

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