import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';

import {firebaseConfig} from '../config';

// Use this to initialize the firebase Apps
const firebaseApp = firebase.initializeApp(firebaseConfig);
// Use these for db & auth

// Import GoogleAuthProvider
import {GoogleAuthProvider} from 'firebase/auth';

const db = firebaseApp.firestore();
const auth = firebaseApp.auth();

const storage = firebaseApp.storage();

export {auth, db, storage, firebaseApp, GoogleAuthProvider};
