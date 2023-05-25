import {firebaseApp, auth, db} from '../config/firebaseConfig.js';
import CryptoJS from 'react-native-crypto-js';
import {secretKey} from "../config";

async function updateUserData(uid, data) {
    await db.collection('users').doc(uid).update(data);
}

async function createUser(uid, data) {
    console.log('Creating user', uid, data);
    await db.collection('users').doc(uid).set(data);
    await createData();
}

const encrypt = (plainText) => {
    console.log('Encrypting', plainText);
    const string = CryptoJS.AES.encrypt(plainText, secretKey).toString();
    console.log('Encrypted', string);
    return string;
};

const decrypt = (cipherText) => {
    const bytes = CryptoJS.AES.decrypt(cipherText, secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
};

async function updateMaxesForUser(data, uid) {
    console.log('Updating maxes for user', uid);
    await db.collection('users').doc(uid).update(data);

}


async function updateData(col, emphasis, week, dayId, id, data) {
    console.log("Updating data");
    console.log("Collection: ", col + " emphasis: " + emphasis + " week: " + week + " dayID: " + dayId + " id: " + id);
    await db.collection("users")
        .doc(auth.currentUser.uid)
        .collection("PushPullLegs").doc(emphasis).collection(week).doc(dayId).collection("exercises").doc(id).update(data);
}

async function createData() {
    const uid = auth.currentUser.uid;
    const emphasises = ["4x - Phase 1", "4x - Phase 2", "4x - Phase 3"];

    console.log('UID:', uid);

    for (const emphasis of emphasises) {
        console.log('Processing emphasis:', emphasis);
        for (let week = 0; week < 14; week++) {
            console.log('Processing week:', week);

            const weekSnapshot = await db
                .collection("PushPullLegs")
                .doc(emphasis)
                .collection(`Week ${week}`)
                .get();

            console.log('Week snapshot:', weekSnapshot);

            const dayPromises = [];
            weekSnapshot.forEach((daySnapshot) => {
                console.log('Processing daySnapshot:', daySnapshot.id);

                const promise = daySnapshot.ref
                    .collection("exercises")
                    .get()
                    .then(async (exerciseSnapshot) => {
                        const exercisePromises = [];
                        exerciseSnapshot.forEach((exerciseDoc) => {
                            console.log('Processing exerciseDoc:', exerciseDoc.id);

                            const exerciseData = exerciseDoc.data();
                            const data = {
                                ...exerciseData,
                                id: exerciseDoc.id,
                            };

                            console.log("Creating document for user: ", uid, " emphasis: ", emphasis, " week: ", week, " day: ", daySnapshot.id, " exercise: ", exerciseDoc.id);
                            const create = db.collection("users").doc(uid).collection("PushPullLegs").doc(emphasis).set({
                                week: week,
                                timestamp: Date.now(),
                            });
                            const create2 = db.collection("users").doc(uid).collection("PushPullLegs").doc(emphasis).collection(`Week ${week}`).doc(daySnapshot.id).set({
                                timestamp: Date.now(),
                            });
                            const exercisePromise = db.collection("users").doc(uid).collection("PushPullLegs").doc(emphasis).collection(`Week ${week}`).doc(daySnapshot.id).collection("exercises").doc(exerciseDoc.id).set(data);
                            exercisePromises.push(exercisePromise);
                        });
                        return Promise.all(exercisePromises);
                    });
                dayPromises.push(promise);
            });
            await Promise.all(dayPromises);
        }
    }
}


export {updateUserData, encrypt, decrypt, updateData, createUser, createData};
