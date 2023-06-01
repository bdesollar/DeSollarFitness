import React, {useState} from 'react';
import {View, StyleSheet, Image, ScrollView} from 'react-native';
import {TextInput, Button, HelperText, Title, Text} from 'react-native-paper';
import {firebaseApp, auth, db} from '../config/firebaseConfig.js';
import {LinearGradient} from "expo-linear-gradient";

const SignUpScreen = ({navigation}) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleNext = async () => {
        navigation.navigate('InitialInfo', {email, password});
    };

    return (
        <LinearGradient
            colors={['#000000', '#434343']}
            style={styles.gradient}
        >
            <ScrollView style={styles.scroll}>
                <View style={styles.container}>
                    <Title style={styles.title}>Sign-Up</Title>
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
                    <Button mode="contained" onPress={handleNext} style={styles.button} textColor={'black'}>
                        Next
                    </Button>
                    <Button
                        mode="text"
                        onPress={() => navigation.navigate('Login')}
                        style={styles.textButton}
                        textColor={'#FFD700'}
                    >
                        Already have an account? Login
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

export default SignUpScreen;
