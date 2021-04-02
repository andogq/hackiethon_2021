let db = firebase.firestore();

db.collection("exercises").get().then(query => {
    query.forEach(doc => {
        console.log(doc.data());
    });
});