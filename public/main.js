const db = firebase.firestore();
const messaging = firebase.messaging();

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
    button: document.getElementById("new_exercise"),
    output: document.getElementById("output")
}

// Event listener to add a random exercise and display it
el.button.addEventListener("click", () => {
    el.output.innerHTML = "";

    let exercise = random_exercise();

    let header = document.createElement("h3");
    header.innerText = exercise.name;
    el.output.appendChild(header);

    let description = document.createElement("p");
    description.innerText = exercise.description;
    el.output.appendChild(description);
});

messaging.onMessage(payload => {
    console.log(`Message received: ${JSON.stringify(payload)}`);
});

messaging.getToken({vapidKey: "BPNO5pl7BCwPKJX5RqQCCunZx7bpXYikrmC2Cei0aK1ysVAXrphwKDWdlnOkfIyiuUQfaxDiFDRW2F36NzmM3XA"}).then(token => {
    if (token) {
        console.log(token);
    } else {
        console.error("Something went wrong")
    }
}).catch(err => {
    console.error(err);
});