import * as dom from "/js/dom.js";

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
        dom.el.span_name.innerText = user.displayName || "User";
    }
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
            dom.el.container_output.innerHTML = "";

            let exercise = random_exercise();
        
            let header = document.createElement("h3");
            header.innerText = exercise.name;
            dom.el.container_output.appendChild(header);
        
            let description = document.createElement("p");
            description.innerText = exercise.description;
            dom.el.container_output.appendChild(description);
        }
    });
}

firebase.auth().onAuthStateChanged(user => {
    if (user) {
        console.log("User signed in");
        dom.el.container_signed_in.style.display = "";
        dom.el.container_signed_out.style.display = "none";

        update_user_name();
    } else {
        console.log("User signed out");
        dom.el.container_signed_in.style.display = "none";
        dom.el.container_signed_out.style.display = "";
    }
});