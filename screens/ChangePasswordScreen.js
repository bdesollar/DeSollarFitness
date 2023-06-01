import React, {useState} from 'react';
import {View, StyleSheet} from 'react-native';
import {TextInput, Button, Text, Title} from 'react-native-paper';
import {db, firebaseApp, auth} from "../config/firebaseConfig";
import firebase from 'firebase/compat/app';
import 'firebase/auth';
import {LinearGradient} from "expo-linear-gradient";


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
        <LinearGradient
            colors={['#000000', '#434343']}
            style={styles.gradient}
        >
            <View style={styles.container}>
                <Title style={styles.title}>Change Password</Title>
                <Text style={styles.label}>Current Password</Text>
                <TextInput
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    secureTextEntry
                    style={styles.input}
                    mode={'outlined'}
                    theme={{colors: {primary: '#FFD700', underlineColor: 'transparent', text: '#FFD700'}}}
                />
                <Text style={styles.label}>New Password</Text>
                <TextInput
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry
                    style={styles.input}
                    mode={'outlined'}
                    theme={{colors: {primary: '#FFD700', underlineColor: 'transparent', text: '#FFD700'}}}
                />
                <Text style={styles.label}>Confirm New Password</Text>
                <TextInput
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    style={styles.input}
                    mode={'outlined'}
                    theme={{colors: {primary: '#FFD700', underlineColor: 'transparent', text: '#FFD700'}}}
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
                <Button mode="contained" onPress={handleChangePassword} style={styles.button} textColor={'black'}>
                    Update Password
                </Button>
                <Text style={styles.message}>{message}</Text>
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    title: {
        marginBottom: 20,
        alignSelf: 'center',
        color: '#FFD700',
        fontSize: 24,
    },
    label: {
        fontSize: 20,
        color: '#FFD700',
        alignSelf: 'flex-start',
        marginBottom: 5,
    },
    input: {
        marginBottom: 10,
    },
    button: {
        marginTop: 10,
        marginBottom: 10,
        backgroundColor: '#FFD700',
    },
    message: {
        marginTop: 15,
        fontSize: 14,
        alignSelf: 'center',
    },
    passwordMatch: {
        color: '#FFD700',
        marginBottom: 10,
        alignSelf: 'center',
    },
    passwordMismatch: {
        color: 'red',
        marginBottom: 10,
        alignSelf: 'center',
    },
    gradient: {
        flex: 1,
    }
});

export default ChangePasswordScreen;
