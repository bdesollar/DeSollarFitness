import {firebaseApp, auth, db} from '../config/firebaseConfig.js';
import CryptoJS from 'react-native-crypto-js';
import {secretKey} from "../config";

async function updateUserData(uid, data) {
    await db.collection('users').doc(uid).update(data);
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

async function addRepsCompletedToExercises() {
    const emphasisList = ["Full Body", "Legs", "Push", "Pull"]; // Add other emphasis types if necessary
    const totalWeeks = 12; // Adjust the total weeks if necessary

    for (const emphasis of emphasisList) {
        for (let week = 1; week <= totalWeeks; week++) {
            const weeksSnapshot = await db
                .collection("workouts")
                .doc(emphasis)
                .collection(`Week ${week}`)
                .get();

            weeksSnapshot.forEach(async (daySnapshot) => {
                const dayId = daySnapshot.id;
                const exercisesSnapshot = await db
                    .collection("workouts")
                    .doc(emphasis)
                    .collection(`Week ${week}`)
                    .doc(dayId)
                    .collection("exercises")
                    .get();

                exercisesSnapshot.forEach(async (exerciseSnapshot) => {
                    const exerciseId = exerciseSnapshot.id;
                    await db
                        .collection("workouts")
                        .doc(emphasis)
                        .collection(`Week ${week}`)
                        .doc(dayId)
                        .collection("exercises")
                        .doc(exerciseId)
                        .update({repsCompleted: 0});
                });
            });
        }
    }
}


export {updateUserData, encrypt, decrypt, addRepsCompletedToExercises};
