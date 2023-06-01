import React, {useEffect, useState} from 'react';
import {View, StyleSheet, ActivityIndicator} from 'react-native';
import {TextInput, Button, Title, Card, Paragraph} from 'react-native-paper';
import {LinearGradient} from 'expo-linear-gradient';
import {db, auth} from "../config/firebaseConfig";

const SetGoalsScreen = ({navigation}) => {
    const [maxSquatGoal, setMaxSquatGoal] = useState(0);
    const [maxBenchGoal, setMaxBenchGoal] = useState(0);
    const [maxDeadliftGoal, setMaxDeadliftGoal] = useState(0);
    const [maxOverheadPressGoal, setMaxOverheadPressGoal] = useState(0);
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        const userSnapshot = await db.collection("users").doc(auth.currentUser.uid).get();
        setUserData(userSnapshot.data());
        setMaxSquatGoal(userSnapshot.data().maxGoals.maxSquatGoal);
        setMaxBenchGoal(userSnapshot.data().maxGoals.maxBenchGoal);
        setMaxDeadliftGoal(userSnapshot.data().maxGoals.maxDeadliftGoal);
        setMaxOverheadPressGoal(userSnapshot.data().maxGoals.maxOverheadPressGoal);
    }

    const handleSetGoals = async () => {
        // Update the array of maxGoals for each lift
        await db.collection("users").doc(auth.currentUser.uid).update({
            maxGoals: {
                maxSquatGoal: maxSquatGoal,
                maxBenchGoal: maxBenchGoal,
                maxDeadliftGoal: maxDeadliftGoal,
                maxOverheadPressGoal: maxOverheadPressGoal
            }
        });
        navigation.navigate("Profile");
    }

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#000000', '#434343']}
                style={styles.gradient}
            >
                {maxOverheadPressGoal && maxDeadliftGoal && maxBenchGoal && maxSquatGoal ?
                    (
                        <>
                            <Title style={styles.title}>Set Your Goals</Title>
                            <Card style={styles.card}>
                                <Card.Content>
                                    <Paragraph style={styles.paragraph}>Set your squat max goal</Paragraph>
                                    <TextInput
                                        label="Squat Max Goal (lbs)"
                                        value={maxSquatGoal}
                                        onChangeText={text => setMaxSquatGoal(text)}
                                        style={styles.input}
                                        keyboardType="numeric"
                                    />
                                    <Paragraph style={styles.paragraph}>Set your bench max goal</Paragraph>
                                    <TextInput
                                        label="Bench Max Goal (lbs)"
                                        value={maxBenchGoal}
                                        onChangeText={text => setMaxBenchGoal(text)}
                                        style={styles.input}
                                        keyboardType="numeric"
                                    />
                                    <Paragraph style={styles.paragraph}>Set your deadlift max goal</Paragraph>
                                    <TextInput
                                        label="Deadlift Max Goal (lbs)"
                                        value={maxDeadliftGoal}
                                        onChangeText={text => setMaxDeadliftGoal(text)}
                                        style={styles.input}
                                        keyboardType="numeric"
                                    />
                                    <Paragraph style={styles.paragraph}>Set your overhead press max goal</Paragraph>
                                    <TextInput
                                        label="Overhead Press Max Goal (lbs)"
                                        value={maxOverheadPressGoal}
                                        onChangeText={text => setMaxOverheadPressGoal(text)}
                                        style={styles.input}
                                        keyboardType="numeric"
                                    />
                                </Card.Content>
                            </Card>
                            <Button mode="contained" style={styles.button} onPress={handleSetGoals}>
                                Set Goals
                            </Button>
                        </>
                    ) : (
                        <ActivityIndicator size="large" color="#FFD700"/>
                    )
                }
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gradient: {
        flex: 1,
        padding: 8,
    },
    title: {
        color: '#FFD700',
        textAlign: 'center',
        marginBottom: 16,
    },
    input: {
        backgroundColor: 'white',
        marginBottom: 16,
    },
    button: {
        backgroundColor: '#FFD700',
    },
    card: {
        backgroundColor: '#434343',
        marginBottom: 16,
    },
    paragraph: {
        color: '#FFD700',
    }
});

export default SetGoalsScreen;
