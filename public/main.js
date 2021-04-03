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

// Stores elements on the page
const el = {
    output: document.getElementById("output")
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