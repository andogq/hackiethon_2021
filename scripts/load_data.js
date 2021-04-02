const admin = require("firebase-admin");
const service_account = require("../service_account.json");

admin.initializeApp({
    credential: admin.credential.cert(service_account)
});

const db = admin.firestore();

["Star Jump", "Push Up"].forEach(async (exercise, i) => {
    await db.collection("exercises").doc(`${i}`).set({
        name: exercise
    });
});

console.log("Exercises added");