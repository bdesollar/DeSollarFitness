import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {Image} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import {DefaultTheme, Provider as PaperProvider} from 'react-native-paper';
import {auth} from './config/firebaseConfig.js';
import logo from './assets/Logo.png';
import RootNavigator from './navigation/RootNavigator';
import * as Notifications from 'expo-notifications';
import firebase from "firebase/compat/app";


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

  requestNotificationPermission();

  // useEffect(() => {
  //   const notesCollection = firebase.firestore().collection('notes');
  //
  //   function onNotesChange() {
  //     return notesCollection.onSnapshot((querySnapshot) => {
  //       querySnapshot.docChanges().forEach((change) => {
  //         if (change.type === 'added' || change.type === 'modified') {
  //           showNotification('Note updated', 'A new note has been added or edited.');
  //           console.log('New note added or edited');
  //         }
  //       });
  //     });
  //   }
  //
  //   const unsubscribe = onNotesChange();
  //   return () => unsubscribe();
  // }, []);

  return (
      <PaperProvider theme={theme}>
        <NavigationContainer>
          <RootNavigator logo={logo}/>
        </NavigationContainer>
      </PaperProvider>
  );
};

export default App;
