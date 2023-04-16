import React, {useState} from 'react';
import {View, StyleSheet, Image} from 'react-native';
import {TextInput, Button, HelperText} from 'react-native-paper';
import {firebaseApp, auth, db} from '../config/firebaseConfig.js';

const SignUpScreen = ({navigation}) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleNext = async () => {
        navigation.navigate('InitialInfo', {email, password});
    };

    return (
        <View style={styles.container}>
            <Image source={require('../assets/Logo.png')} style={styles.logo}/>
            <TextInput
                label="Email"
                value={email}
                onChangeText={text => setEmail(text)}
                style={styles.input}
            />
            <TextInput
                label="Password"
                value={password}
                onChangeText={text => setPassword(text)}
                secureTextEntry
                style={styles.input}
            />
            <HelperText type="error" visible={error !== ''}>
                {error}
            </HelperText>
            <Button mode="contained" onPress={handleNext} style={styles.button}>
                Next
            </Button>
            <Button
                mode="text"
                onPress={() => navigation.navigate('Login')}
                style={styles.textButton}>
                Already have an account? Login
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
        top: 60,
    },
});

export default SignUpScreen;
