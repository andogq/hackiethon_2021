const admin = require("firebase-admin");
const service_account = require("../service_account.json");

admin.initializeApp({
    credential: admin.credential.cert(service_account)
});

const db = admin.firestore();

const data = {
    "exercises": {
        "tricept_dip": {
            "name": "Tricept Dip",
            "min": 5,
            "max": 20,
            "description": "Blah blah blah",
            "url": "https://thumbs.gfycat.com/ImpeccableEquatorialAmericanbittern-size_restricted.gif"
        },
        "desk_pushup": {
            "name": "Desk Pushup",
            "min": 5,
            "max": 20,
            "description": "Stuff yeah wow",
            "url": "https://thumbs.gfycat.com/IlliterateAjarGourami-size_restricted.gif"
        },
        "neck_stretch": {
            "name": "Neck Stretch",
            "min": 2,
            "max": 6,
            "description": "Do a stretch",
            "url": "https://images-prod.healthline.com/hlcmsresource/images/topic_centers/Fitness-Exercise/400x400_Stretches_to_Do_at_Work_Every_Day_Neck_Stretch.gif"
        },
        "lunge": {
            "name": "Lunge",
            "min": 2,
            "max": 6,
            "description": "Yeah! Do it.",
            "url": "https://thumbs.gfycat.com/IdealisticTerribleIcefish-size_restricted.gif"
        },
        "side_lunge": {
            "name": "Side Lunge",
            "min": 2,
            "max": 6,
            "description": "Supurb!",
            "url": "https://thumbs.gfycat.com/MasculineAlertIndiancow-size_restricted.gif"
        },
        "seated_leg_extension": {
            "name": "Seated Leg Extension",
            "min": 2,
            "max": 6,
            "description": "Wow!",
            "url": "https://thumbs.gfycat.com/AgitatedRawHeron-size_restricted.gif"
        },
        "upper_body_and_arm_stretch": {
            "name": "Upper Body and Arm Stretch",
            "min": 2,
            "max": 6,
            "description": "Sublime!",
            "url": "https://images-prod.healthline.com/hlcmsresource/images/topic_centers/Fitness-Exercise/400x400_Stretches_to_Do_at_Work_Every_Day_Upper_Body_Stretch.gif"
        },
        "shoulder_and_pec_stretch": {
            "name": "Shoulder and Pec Stretch",
            "min": 2,
            "max": 6,
            "description": "Incredible!",
            "url": "https://images-prod.healthline.com/hlcmsresource/images/topic_centers/Fitness-Exercise/400x400_Stretches_to_Do_at_Work_Every_Day_Shoulder_Pec_Stretch.gif"
        },
        "upper_trap_stretch": {
            "name": "Upper Trap Stretch",
            "min": 2,
            "max": 6,
            "description": "Amazing!",
            "url": "https://images-prod.healthline.com/hlcmsresource/images/topic_centers/Fitness-Exercise/400x400_Stretches_to_Do_at_Work_Every_Day_Upper_Trap_Stretch.gif"
        }
    }
}

Object.keys(data).forEach(async d => {
    Object.keys(data[d]).forEach(async doc => {
        await db.collection(d).doc(doc).set(data[d][doc]);
    });
});

console.log("Exercises added");
