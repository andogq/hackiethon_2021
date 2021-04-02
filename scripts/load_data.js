const admin = require("firebase-admin");
const service_account = require("../service_account.json");

admin.initializeApp({
    credential: admin.credential.cert(service_account)
});

const db = admin.firestore();

const data = {
    "star_jump": {
        "name": "Star Jump",
        "min": 5,
        "max": 20,
        "description": "Blah blah blah"
    },
    "push_up": {
        "name": "Push Up",
        "min": 5,
        "max": 20,
        "description": "Stuff yeah wow"
    },
    "neck_stretch": {
        "name": "Neck Stretch",
        "min": 2,
        "max": 6,
        "description": "Do a stretch"
    }
}

Object.keys(data).forEach(async (exercise) => {
    await db.collection("exercises").doc(exercise).set(data[exercise]);
});

console.log("Exercises added");