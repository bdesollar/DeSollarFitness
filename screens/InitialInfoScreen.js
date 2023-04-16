import React, {useEffect, useState} from 'react';
import {StyleSheet} from 'react-native';
import {TextInput, Button, HelperText} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';
import {auth, db} from '../config/firebaseConfig.js';

const InitialInfoScreen = ({navigation, route, onEmailVerified}) => {
    const [name, setName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [bio, setBio] = useState('');
    const [error, setError] = useState('');
    const [emailSent, setEmailSent] = useState(false);
    const {email, password} = route.params;

    useEffect(() => {
        let intervalId;

        const checkVerification = async () => {
            // if (auth.currentUser && emailSent) {
            if (auth.currentUser) {
                await auth.currentUser.reload();
                // if (auth.currentUser.emailVerified) {
                //     if (onEmailVerified) {
                //         onEmailVerified();
                //     }
                    clearInterval(intervalId);
                    await handleCreateUser();
                // } else {
                //     setError('Please verify your email.');
                // }
            }
        };

        if (emailSent) {
            intervalId = setInterval(checkVerification, 2000); // Check every 3 seconds
        }

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [emailSent]);

    const handleSignUp = async () => {
        if (name === '') {
            setError('Name is required.');
            return;
        } else if (phoneNumber === '') {
            setError('Phone number is required.');
            return;
        }
        try {
            // Create user in Firebase Auth
            const {user} = await auth.createUserWithEmailAndPassword(email, password);
            // Confirm email before creating user
            await auth.currentUser.sendEmailVerification();
            setEmailSent(true);
            setError('Verification email sent. Please check your inbox.');
        } catch (err) {
            setError(err.message);
        }
    };

    const handleCreateUser = async () => {
        // Add user info to Firestore
        await db.collection('users').doc(auth.currentUser.uid).set({
            name,
            phoneNumber,
            bio,
        });

        navigation.navigate('Login');
    };

    const resendVerificationEmail = async () => {
        if (auth.currentUser) {
            await auth.currentUser.sendEmailVerification();
            setEmailSent(true);
            setError('Verification email resent. Please check your inbox.');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <HelperText type="error" visible={error !== ''}>
                {error}
            </HelperText>
            <TextInput
                label="Name"
                value={name}
                onChangeText={setName}
                style={styles.input}
            />
            <TextInput
                label="Phone Number"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                style={styles.input}
            />
            <TextInput
                label="Bio"
                value={bio}
                onChangeText={setBio}
                multiline
                style={styles.input}
            />
            <Button mode="contained" onPress={handleSignUp}>
                Sign Up
            </Button>
            {emailSent && (
                <Button mode="text" onPress={resendVerificationEmail}>
                    Resend Verification Email
                </Button>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 20,
        backgroundColor: '#fff',
    },
    input: {
        marginVertical: 10,
    },
});

export default InitialInfoScreen;
