import React, {useState} from 'react';
import {Image, StyleSheet, View, ScrollView} from 'react-native';
import {Button, TextInput, HelperText, Text, Title, Avatar} from 'react-native-paper';
import {auth} from '../config/firebaseConfig';
import {LinearGradient} from "expo-linear-gradient";

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
        <LinearGradient
            colors={['#000000', '#434343']}
            style={styles.gradient}
        >
            <ScrollView style={styles.scroll}>
                <View style={styles.container}>
                    <Title style={styles.title}>Login</Title>
                    <Image source={require('../assets/Logo.png')} style={styles.logo}/>
                    <HelperText type="error" visible={error !== ''} style={styles.errorText}>
                        {error}
                    </HelperText>
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        style={styles.input}
                        mode="outlined"
                        theme={{colors: {primary: '#FFD700', underlineColor: 'transparent', text: '#FFD700'}}}
                    />
                    <Text style={styles.label}>Password</Text>
                    <TextInput
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        style={styles.input}
                        mode="outlined"
                        theme={{colors: {primary: '#FFD700', underlineColor: 'transparent', text: '#FFD700'}}}
                    />
                    <Button mode="contained" onPress={handleLogin} style={styles.button} textColor={'black'}>
                        Log In
                    </Button>
                    {error && (
                        <Button mode="text" onPress={resendVerificationEmail} style={styles.textButton}
                                textColor={'#FFD700'}>
                            Resend Verification Email
                        </Button>
                    )}
                    <Button mode="text" onPress={() => navigation.navigate('SignUp')} style={styles.textButton}
                            textColor={'#FFD700'}>
                        Sign Up
                    </Button>
                    <Button
                        mode="text"
                        onPress={() => navigation.navigate('ForgotPassword')}
                        style={styles.textButton}
                        textColor={'#FFD700'}
                    >
                        Forgot Password
                    </Button>
                </View>
            </ScrollView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    input: {
        marginBottom: 20,
        backgroundColor: '#fff',
    },
    logo: {
        height: 150,
        width: 150,
        borderRadius: 50,
        marginBottom: 10,
        marginTop: 30,
        alignSelf: 'center',
        backgroundColor: '#fff',
    },
    button: {
        marginBottom: 20,
        backgroundColor: '#FFD700',
    },
    textButton: {
        marginBottom: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFD700',
        textAlign: 'center',
        marginBottom: 20,
        marginTop: 35,
    },
    label: {
        fontSize: 18,
        color: '#FFD700',
        marginBottom: 5,
    },
    errorText: {
        fontSize: 16,
        color: '#FF0000',
        marginBottom: 20,
    },
    scroll: {
        flex: 1,
    },
    gradient: {
        flex: 1,
    }
});

export default LoginScreen;
