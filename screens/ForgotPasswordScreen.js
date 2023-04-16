import React, {useState} from 'react';
import {View, StyleSheet, Image} from 'react-native';
import {TextInput, Button, HelperText} from 'react-native-paper';
import {firebaseApp, auth, db} from '../config/firebaseConfig.js';

const ForgotPasswordScreen = ({navigation}) => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const handleResetPassword = async () => {
        try {
            await auth.sendPasswordResetEmail(email);
            setMessage('Password reset email sent.');
            setError('');
        } catch (err) {
            setError(err.message);
            setMessage('');
        }
    };

    return (
        <View style={styles.container}>
            <Image source={require('../assets/Logo.png')} style={styles.logo}/>
            <TextInput
                label="Email"
                value={email}
                onChangeText={(text) => setEmail(text)}
                style={styles.input}
            />
            <HelperText type="error" visible={error !== ''}>
                {error}
            </HelperText>
            <HelperText type="info" visible={message !== ''}>
                {message}
            </HelperText>
            <Button
                mode="contained"
                onPress={handleResetPassword}
                style={styles.button}
            >
                Reset Password
            </Button>
            <Button
                mode="text"
                onPress={() => navigation.navigate('Login')}
                style={styles.textButton}
            >
                Back to Login
            </Button>
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
    input: {
        marginBottom: 16,
    },
    button: {
        marginBottom: 8,
    },
    textButton: {
        marginBottom: 8,
    },
    logo: {
        height: 300,
        width: 300,
        resizeMode: 'contain',
        alignSelf: 'center',
        position: 'absolute',
        top: 75,
    },
});

export default ForgotPasswordScreen;
