import React, {useState} from 'react';
import {View, StyleSheet} from 'react-native';
import {TextInput, Button, Text, Title} from 'react-native-paper';
import {db, firebaseApp, auth} from "../config/firebaseConfig";
import firebase from 'firebase/compat/app';
import 'firebase/auth';


const ChangePasswordScreen = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleChangePassword = async () => {
        const user = auth.currentUser;
        const credential = firebase.auth.EmailAuthProvider.credential(
            user.email,
            currentPassword
        );

        try {
            await user.reauthenticateWithCredential(credential);

            if (newPassword === confirmPassword) {
                await user.updatePassword(newPassword);
                setMessage('Password updated successfully.');
            } else {
                setMessage('New passwords do not match.');
            }
        } catch (error) {
            setMessage('Error updating password: ' + error.message);
        }
    };

    return (
        <View style={styles.container}>
            <Title style={styles.title}>Change Password</Title>
            <TextInput
                label="Current Password"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry
                style={styles.input}
                mode={'outlined'}
            />
            <TextInput
                label="New Password"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                style={styles.input}
                mode={'outlined'}
            />
            <TextInput
                label="Confirm New Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                style={styles.input}
                mode={'outlined'}
            />
            <Text
                style={
                    newPassword === confirmPassword
                        ? styles.passwordMatch
                        : styles.passwordMismatch
                }
            >
                {newPassword === confirmPassword ? 'Passwords match' : 'Passwords do not match'}
            </Text>
            <Button mode="contained" onPress={handleChangePassword} style={styles.button}>
                Update Password
            </Button>
            <Text style={styles.message}>{message}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 20,
        backgroundColor: '#fff',
    },
    title: {
        marginBottom: 20,
        alignSelf: 'center',
    },
    input: {
        marginBottom: 10,
    },
    button: {
        marginTop: 10,
    },
    message: {
        marginTop: 15,
        fontSize: 14,
        alignSelf: 'center',
    },
    passwordMatch: {
        color: 'green',
        marginBottom: 10,
        alignSelf: 'center',
    },
    passwordMismatch: {
        color: 'red',
        marginBottom: 10,
        alignSelf: 'center',
    },
});

export default ChangePasswordScreen;
