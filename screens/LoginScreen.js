import React, {useState} from 'react';
import {Image, StyleSheet, View} from 'react-native';
import {Button, TextInput, HelperText} from 'react-native-paper';
import {auth} from '../config/firebaseConfig';

const LoginScreen = ({navigation}) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async () => {
        try {
            const {user} = await auth.signInWithEmailAndPassword(email, password);

            if (!user.emailVerified) {
                setError('Please verify your email before logging in.');
            }
        } catch (err) {
            setError(err.message);
        }
    };

    const resendVerificationEmail = async () => {
        try {
            const currentUser = auth.currentUser;
            if (currentUser) {
                await currentUser.sendEmailVerification();
                setError('Verification email resent. Please check your inbox.');
            } else {
                setError('Error resending verification email.');
            }
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <View style={styles.container}>
            <Image source={require('../assets/Logo.png')} style={styles.logo}/>
            <HelperText type="error" visible={error !== ''}>
                {error}
            </HelperText>
            <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                style={styles.input}
            />
            <TextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
            />
            <Button mode="contained" onPress={handleLogin}>
                Log In
            </Button>
            {error && (
                <Button mode="text" onPress={resendVerificationEmail}>
                    Resend Verification Email
                </Button>
            )}
            <Button mode="text" onPress={() => navigation.navigate('SignUp')}>
                Sign Up
            </Button>
            <Button
                mode="text"
                onPress={() => navigation.navigate('ForgotPassword')}
            >
                Forgot Password
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
        marginVertical: 10,
    },
    logo: {
        height: 150,
        width: 150,
        resizeMode: 'contain',
        alignSelf: 'center',
        position: 'absolute',
        top: 125,
    },
});

export default LoginScreen;
