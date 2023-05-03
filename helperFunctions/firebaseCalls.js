import {firebaseApp, auth, db} from '../config/firebaseConfig.js';
import CryptoJS from 'react-native-crypto-js';
import {secretKey} from "../config";

async function updateUserData(uid, data) {
    await db.collection('users').doc(uid).update(data);
}

async function createUser(uid, data) {
    console.log('Creating user', uid, data);
    await db.collection('users').doc(uid).set(data);
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
    await db.collection(col).doc(emphasis).collection(week).doc(dayId).collection("exercises").doc(id).update(data);
}

export {updateUserData, encrypt, decrypt, updateData, createUser};
