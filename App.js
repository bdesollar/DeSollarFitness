import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {Image} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import {DefaultTheme, Provider as PaperProvider} from 'react-native-paper';
import {auth, db} from './config/firebaseConfig.js';
import logo from './assets/Logo.png';
import RootNavigator from './navigation/RootNavigator';
import * as Notifications from 'expo-notifications';
import firebase from "firebase/compat/app";
import WorkoutContext from './context/WorkoutContext';
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import * as SQLite from 'expo-sqlite';
import {syncFirebaseWithSql} from "./helperFunctions/firebaseCalls";

const theme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        // Navy Blue
        primary: '#0c2e8c',
        accent: '#f1f1f1',
        background: '#f1f1f1',
        surface: '#f1f1f1',
        text: '#000000',
        disabled: '#000000',
        placeholder: '#000000',
        backdrop: '#f1f1f1',
        onBackground: '#000000',
        onSurface: '#000000',
        error: '#f13a59',
        notification: '#f50057',
    },
    dark: true,
    roundness: 2,
    animation: {
        scale: 1.0,
    },
    mode: 'adaptive',
};

const TASK_NAME = "BACKGROUND_SYNC";

TaskManager.defineTask(TASK_NAME, async () => {
    try {
        const receivedNewData = await syncData();

        console.log("Received new data: ", receivedNewData);

        return receivedNewData ? BackgroundFetch.Result.NewData : BackgroundFetch.Result.NoData;
    } catch (err) {
        return BackgroundFetch.Result.Failed;
    }
});


async function syncData() {
    await syncFirebaseWithSql();
}


async function requestNotificationPermission() {
    const {status: existingStatus} = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const {status} = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        console.log('Notification permissions denied');
        return;
    }
}

async function showNotification(title, message) {
    await Notifications.scheduleNotificationAsync({
        content: {
            title: title,
            body: message,
        },
        trigger: null,
    });
}

const App = () => {
    const [emphasis, setEmphasis] = useState('default');
    const [week, setWeek] = useState(1);

    useEffect(() => {
        registerBackgroundFetch().then(r => console.log("Registered background task"));
    }, []);

    async function registerBackgroundFetch() {
        try {
            await BackgroundFetch.registerTaskAsync(TASK_NAME, {
                stopOnTerminate: false,
                startOnBoot: true,
            });

            console.log("Task registered");
        } catch (err) {
            console.log("Task Register failed:", err);
        }
    }


    requestNotificationPermission();

    return (
        <WorkoutContext.Provider
            value={{
                emphasis,
                setEmphasis,
                week,
                setWeek,
            }}
        >
            <PaperProvider theme={theme}>
                <NavigationContainer>
                    <RootNavigator logo={logo}/>
                </NavigationContainer>
            </PaperProvider>
        </WorkoutContext.Provider>
    );
};

export default App;
