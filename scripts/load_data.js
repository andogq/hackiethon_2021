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
            "min": 4,
            "max": 10,
            "description": "Tricept dips are done by facing away from a bracing surface, placing your palms on the surface behind you and lowering yourself until your upper arm is parallel to the ground. Use the front edge of your chair or desk to perform a dip.",
            "url": "https://thumbs.gfycat.com/ImpeccableEquatorialAmericanbittern-size_restricted.gif"
        },
        "desk_pushup": {
            "name": "Desk Pushup",
            "min": 4,
            "max": 18,
            "description": "Pushups are done by placing your palms down on a surface in front of you, then using your arms to lower yourself until your elbows make right angles. You can use the surface of your desk or chair to make the exercise easier.",
            "url": "https://thumbs.gfycat.com/IlliterateAjarGourami-size_restricted.gif"
        },
        "neck_stretch": {
            "name": "Neck Stretch",
            "min": 10,
            "max": 20,
            "description": "Sit in your chair an roll your head in slow circles or semi-circles.",
            "url": "https://images-prod.healthline.com/hlcmsresource/images/topic_centers/Fitness-Exercise/400x400_Stretches_to_Do_at_Work_Every_Day_Neck_Stretch.gif"
        },
        "lunge": {
            "name": "Lunge",
            "min": 2,
            "max": 6,
            "description": "Stand tall, take a step forward with one leg, then lower yourself, bending your knees until your rear knee nearly touches the ground, then return to standing.",
            "url": "https://thumbs.gfycat.com/IdealisticTerribleIcefish-size_restricted.gif"
        },
        "side_lunge": {
            "name": "Side Lunge",
            "min": 2,
            "max": 6,
            "description": "Stand with legs wide apart, bend one knee, lowering yourself to one side.",
            "url": "https://thumbs.gfycat.com/MasculineAlertIndiancow-size_restricted.gif"
        },
        "seated_leg_extension": {
            "name": "Seated Leg Extension",
            "min": 2,
            "max": 6,
            "description": "Sit tall with your feet flat on the floor, extend one leg forward until your leg is extended straight out in front of you.",
            "url": "https://thumbs.gfycat.com/AgitatedRawHeron-size_restricted.gif"
        },
        "upper_body_and_arm_stretch": {
            "name": "Upper Body and Arm Stretch",
            "min": 2,
            "max": 6,
            "description": "Raise arms above your head, interlocking fingers with palms facing up. Extend your arms until they are fully outstretched.",
            "url": "https://images-prod.healthline.com/hlcmsresource/images/topic_centers/Fitness-Exercise/400x400_Stretches_to_Do_at_Work_Every_Day_Upper_Body_Stretch.gif"
        },
        "shoulder_and_pec_stretch": {
            "name": "Shoulder and Pec Stretch",
            "min": 2,
            "max": 6,
            "description": "Clasp your hands together behind your back, press your arms down and rearward while extending your chest forward.",
            "url": "https://images-prod.healthline.com/hlcmsresource/images/topic_centers/Fitness-Exercise/400x400_Stretches_to_Do_at_Work_Every_Day_Shoulder_Pec_Stretch.gif"
        },
        "upper_trap_stretch": {
            "name": "Upper Trap Stretch",
            "min": 2,
            "max": 6,
            "description": "Keep one arm held straight down against the side of the body. Use the other arm to gently pull your head to the side.",
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
