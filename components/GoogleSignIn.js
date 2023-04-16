import React from 'react';
import { Button } from 'react-native-paper';
import * as Google from 'expo-google-app-auth';

const config = {
    iosClientId: 'your-ios-client-id',
    androidClientId: 'your-android-client-id',
};

const GoogleSignIn = () => {
    const signInWithGoogle = async () => {
        try {
            const result = await Google.logInAsync(config);
            if (result.type === 'success') {
                const credential = firebase.auth.GoogleAuthProvider.credential(
                    result.idToken
                );
                await firebase.auth().signInWithCredential(credential);
            }
        } catch (err) {
            console.error('Google Sign In Error:', err);
        }
    };

    return (
        <Button
            icon="google"
            mode="outlined"
            onPress={signInWithGoogle}
        >
            Sign in with Google
        </Button>
    );
};

export default GoogleSignIn;
