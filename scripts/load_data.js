const admin = require("firebase-admin");
const service_account = require("../service_account.json");

admin.initializeApp({
    credential: admin.credential.cert(service_account)
});

const db = admin.firestore();

const data = {
    "exercises": {
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
    },
    "users": {
        "yeICQUZJaW2idgAph0cLlf0FuAyE": {
            "preference_1": true,
            "more_stuff": [0, 10]
        }
    }
}

Object.keys(data).forEach(async d => {
    Object.keys(data[d]).forEach(async doc => {
        await db.collection(d).doc(doc).set(data[d][doc]);
    });
});

console.log("Exercises added");