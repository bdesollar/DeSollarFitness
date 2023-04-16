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

export {updateUserData, encrypt, decrypt};
