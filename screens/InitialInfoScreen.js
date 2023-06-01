import React, {useEffect, useState} from 'react';
import {Image, ScrollView, StyleSheet, View} from 'react-native';
import {TextInput, Button, HelperText, Title, Text} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';
import {auth, db} from '../config/firebaseConfig.js';
import {createData, createUser} from "../helperFunctions/firebaseCalls";
import {LinearGradient} from "expo-linear-gradient";

const InitialInfoScreen = ({navigation, route, onEmailVerified}) => {
    const [name, setName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [bio, setBio] = useState('');
    const [error, setError] = useState('');
    const {email, password} = route.params;

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
            await handleCreateUser();
            setError('Verification email sent. Please check your inbox.');
        } catch (err) {
            setError(err.message);
        }
    };

    const handleCreateUser = async () => {
        const data = {
            name,
            email: auth.currentUser.email,
            uid: auth.currentUser.uid,
            phoneNumber,
            bio,
            maxes: {
                squat: 0,
                bench: 0,
                deadlift: 0,
                overheadPress: 0,
            },
            maxGoals: {
                maxSquatGoal: 0,
                maxBenchGoal: 0,
                maxDeadliftGoal: 0,
                maxOverheadPressGoal: 0,
            }
        }
        await createUser(auth.currentUser.uid, data);
        await createData();

        navigation.navigate('Home');
    };

    return (
        <LinearGradient
            colors={['#000000', '#434343']}
            style={styles.gradient}
        >
            <ScrollView style={styles.scroll}>
                <View style={styles.container}>
                    <Title style={styles.title}>Initial Information</Title>
                    <Image source={require('../assets/Logo.png')} style={styles.logo}/>
                    <HelperText type="error" visible={error !== ''} style={styles.errorText}>
                        {error}
                    </HelperText>
                    <Text style={styles.label}>Name</Text>
                    <TextInput
                        value={name}
                        onChangeText={setName}
                        keyboardType="default"
                        style={styles.input}
                        mode="outlined"
                        theme={{colors: {primary: '#FFD700', underlineColor: 'transparent', text: '#FFD700'}}}
                    />
                    <Text style={styles.label}>Bio</Text>
                    <TextInput
                        value={bio}
                        onChangeText={setBio}
                        keyboardType="default"
                        style={styles.input}
                        mode="outlined"
                        theme={{colors: {primary: '#FFD700', underlineColor: 'transparent', text: '#FFD700'}}}
                    />
                    <Text style={styles.label}>Phone Number</Text>
                    <TextInput
                        value={phoneNumber}
                        onChangeText={setPhoneNumber}
                        keyboardType="phone-pad"
                        style={styles.input}
                        mode="outlined"
                        theme={{colors: {primary: '#FFD700', underlineColor: 'transparent', text: '#FFD700'}}}
                    />
                    <Button mode="contained" onPress={handleSignUp} style={styles.button} textColor={'black'}>
                        Sign Up
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

export default InitialInfoScreen;
