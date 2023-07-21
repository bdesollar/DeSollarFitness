import {firebaseApp, auth, db} from '../config/firebaseConfig.js';
import CryptoJS from 'react-native-crypto-js';
import {secretKey} from "../config";
import * as SQLite from "expo-sqlite";

async function updateUserData(uid, data) {
    await db.collection('users').doc(uid).update(data);
}

async function createUser(uid, data) {
    await db.collection('users').doc(uid).set(data);
    await createData();
}

const encrypt = (plainText) => {
    const string = CryptoJS.AES.encrypt(plainText, secretKey).toString();
    return string;
};

const decrypt = (cipherText) => {
    const bytes = CryptoJS.AES.decrypt(cipherText, secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
};

async function updateMaxesForUser(data, uid) {
    await db.collection('users').doc(uid).update(data);

}


async function updateData(col, emphasis, week, dayId, id, data) {
    await db.collection("users")
        .doc(auth.currentUser.uid)
        .collection("PushPullLegs").doc(emphasis).collection(week).doc(dayId).collection("exercises").doc(id).update(data);
}

async function createData() {
    const uid = auth.currentUser.uid;
    const emphasises = ["4x - Phase 1", "4x - Phase 2", "4x - Phase 3"];

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

async function saveDataToSQLite() {
    console.log('Saving data to SQLite');
    const dbSql = SQLite.openDatabase('db.desollarFitness');
    const uid = auth.currentUser.uid;

    // Fetch all user data from Firebase
    const userSnapshot = await db.collection('users').doc(uid).get();
    const userData = userSnapshot.data();

    console.log('User data:', userData);

    // Create table for users and log any errors
    dbSql.transaction(tx => {
        tx.executeSql('create table if not exists users (id text primary key not null, name text, email text, avatar text, coverPhoto text, totalWeightLifted int, totalRepsDone int);', [], null, (tx, error) => {
            console.log('Error for creating user', error);
        });
    });

    // Save or replace user data in SQLite
    dbSql.transaction(tx => {
        tx.executeSql('replace into users (id, name, email, avatar, coverPhoto, totalWeightLifted, totalRepsDone) values (?, ?, ?, ?, ?, ?, ?)', [uid, userData.name, userData.email, userData.avatar, userData.coverPhoto, userData.totalWeightLifted, userData.totalRepsDone], null, (tx, error) => {
            console.log('Error', error);
        });
    });

    // Create table for workouts and log any errors
    dbSql.transaction(tx => {
        tx.executeSql('create table if not exists workouts (id text primary key not null, userId text, emphasis text, week integer, day text, exercise text, data text, FOREIGN KEY(userId) REFERENCES users(id));', [], null, (tx, error) => {
            console.log('Error', error);
        });
    });

    // Fetch all workout data from Firebase
    const emphasises = ["4x - Phase 1", "4x - Phase 2", "4x - Phase 3"];
    const workouts = [];

    for (const emphasis of emphasises) {
        console.log('Processing emphasis:', emphasis);
        for (let week = 0; week < 14; week++) {
            //console.log('Processing week:', week);

            const weekSnapshot = await db
                .collection("users")
                .doc(uid)
                .collection("PushPullLegs")
                .doc(emphasis)
                .collection(`Week ${week}`)
                .get();

            //console.log('Week snapshot:', weekSnapshot);

            // weekSnapshot.forEach((daySnapshot) => {
            for (const daySnapshot of weekSnapshot.docs) {
                //console.log('Processing daySnapshot:', daySnapshot.id);

                const daySnapshotData = await daySnapshot.ref
                    .collection("exercises")
                    .get();

                daySnapshotData.forEach((exerciseDoc) => {
                    //console.log('Processing exerciseDoc:', exerciseDoc.id);

                    const exerciseData = exerciseDoc.data();
                    const data = {
                        ...exerciseData,
                        id: exerciseDoc.id,
                    };

                    //console.log("Creating document for user: ", uid, " emphasis: ", emphasis, " week: ", week, " day: ", daySnapshot.id, " exercise: ", exerciseDoc.id);

                    // generate an id for the workout
                    const workout = {
                        id: 'workout-' + week + '-' + daySnapshot.id + '-' + exerciseDoc.id + uid,
                        userId: uid,
                        emphasis: emphasis,
                        week: week,
                        day: daySnapshot.id,
                        exercise: exerciseDoc.id,
                        data: JSON.stringify(data)
                    }

                    workouts.push(workout);
                });
            }
        }
    }

    // Save workout data to SQLite
    dbSql.transaction(tx => {
        for (let workout of workouts) {
            tx.executeSql('replace into workouts (id, userId, emphasis, week, day, exercise, data) values (?, ?, ?, ?, ?, ?, ?)', [workout.id, workout.userId, workout.emphasis, workout.week, workout.day, workout.exercise, workout.data], null, (tx, error) => {
                console.log('Error', error);
            });
        }
    });

    // Fetch the workout history from Firebase
    const workoutHistorySnapshot = await db.collection('workoutHistory').get();
    const workoutHistory = [];

    workoutHistorySnapshot.forEach((doc) => {
        const data = doc.data();
        for (const key in data) {
            //console.log('Key:', key);
            let keys = key.split(', ');
            console.log('Keys:', keys);
            // convert key to a string
            const workout = {
                id: 'workout-' + keys[1] + '-' + keys[2] + '-' + keys[3] + uid,
                date: keys[3],
                emphasis: keys[0],
                week: keys[1],
                day: keys[2],
                data: data[key]
            }
            console.log('Workout data:', data[key]);
            workoutHistory.push(workout);
        }
        // console.log('Workout history data:', workoutHistory);
    });

    // Create table for workout history and log any errors
    dbSql.transaction(tx => {
        tx.executeSql('create table if not exists workoutHistory (id text primary key not null, date text, emphasis text, week text, day text, data text);', [], null, (tx, error) => {
            console.log('Error', error);
        });
    });

    // Save workout history data to SQLite
    dbSql.transaction(tx => {
        for (let workout of workoutHistory) {
            tx.executeSql('replace into workoutHistory (id, date, emphasis, week, day, data) values (?, ?, ?, ?, ?, ?)', [workout.id, workout.date, workout.emphasis, workout.week, workout.day, workout.data], null, (tx, error) => {
                console.log('Error', error);
            });
        }
    });

    console.log('Finished saving data to SQLite');

    return true;
}

async function syncFirebaseWithSql() {
    console.log('Syncing Firebase with SQLite');
    const dbSql = SQLite.openDatabase('db.desollarFitness');
    const uid = auth.currentUser.uid;

    // Fetch all user data from SQLite
    let userData = {};
    dbSql.transaction(tx => {
        tx.executeSql('select * from users where id = ?', [uid], (tx, results) => {
            if (results.rows.length > 0) {
                userData = results.rows.item(0);
            }
        }, (tx, error) => {
            console.log('Error', error);
        });
    });

    // Save or replace user data in Firebase
    await db.collection('users').doc(uid).update(userData);

    // Fetch all workout data from SQLite
    let workouts = [];
    dbSql.transaction(tx => {
        tx.executeSql('select * from workouts where userId = ?', [uid], (tx, results) => {
            for (let i = 0; i < results.rows.length; i++) {
                workouts.push(results.rows.item(i));
            }
        }, (tx, error) => {
            console.log('Error', error);
        });
    });

    // Save workout data to Firebase
    for (let workout of workouts) {
        await db.collection('users').doc(uid).collection('PushPullLegs').doc(workout.emphasis).collection(`Week ${workout.week}`).doc(workout.day).collection('exercises').doc(workout.exercise).set(JSON.parse(workout.data));
    }

    // Fetch all workout history data from SQLite
    let workoutHistory = [];
    dbSql.transaction(tx => {
        tx.executeSql('select * from workoutHistory', [], (tx, results) => {
            for (let i = 0; i < results.rows.length; i++) {
                workoutHistory.push(results.rows.item(i));
            }
        }, (tx, error) => {
            console.log('Error', error);
        });
    });

    // Save workout history data to Firebase
    for (let workout of workoutHistory) {
        await db.collection('workoutHistory').doc(`${workout.emphasis}, ${workout.week}, ${workout.day}, ${workout.date}`).set(JSON.parse(workout.data));
    }

    console.log('Finished syncing Firebase with SQLite');

}


export {updateUserData, encrypt, decrypt, updateData, createUser, createData, saveDataToSQLite, syncFirebaseWithSql};
