import React, {useState, useEffect} from 'react';
import {View, StyleSheet, FlatList} from 'react-native';
import {Card, Title, Paragraph, TextInput, Button} from 'react-native-paper';
import {WebView} from 'react-native-webview';

const WorkoutViewScreen = () => {
    const [workoutData, setWorkoutData] = useState([]);

    useEffect(() => {
        // Fetch data from Firebase and update workoutData variable here.
        // For now, we'll use dummy data.
        const dummyData = [
            {
                id: '1',
                exercise: 'Squats',
                youtubeUrl: 'https://www.youtube.com/embed/aclHkVaku9U',
                targetWeight: 200,
                targetReps: 10,
                actualWeight: 0,
                actualReps: 0,
            },
            {
                id: '2',
                exercise: 'Bench Press',
                youtubeUrl: 'https://www.youtube.com/embed/rT7DgCr-3pg',
                targetWeight: 150,
                targetReps: 8,
                actualWeight: 0,
                actualReps: 0,
            },
            // Add more exercises
        ];
        setWorkoutData(dummyData);
    }, []);

    const updateWeight = (id, value) => {
        setWorkoutData(
            workoutData.map((item) => (item.id === id ? {...item, actualWeight: value} : item))
        );
    };

    const updateReps = (id, value) => {
        setWorkoutData(
            workoutData.map((item) => (item.id === id ? {...item, actualReps: value} : item))
        );
    };

    const renderItem = ({item}) => (
        <Card style={styles.card}>
            <Card.Content>
                <Title>{item.exercise}</Title>
                <WebView
                    style={styles.video}
                    source={{uri: item.youtubeUrl}}
                    allowsFullscreenVideo={true}
                />
                <Paragraph>Target: {item.targetWeight} lbs x {item.targetReps} reps</Paragraph>
                <TextInput
                    label="Weight"
                    value={String(item.actualWeight)}
                    onChangeText={(value) => updateWeight(item.id, parseInt(value))}
                    keyboardType="numeric"
                    style={styles.input}
                />
                <TextInput
                    label="Reps"
                    value={String(item.actualReps)}
                    onChangeText={(value) => updateReps(item.id, parseInt(value))}
                    keyboardType="numeric"
                    style={styles.input}
                />
            </Card.Content>
        </Card>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={workoutData}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
            />
            <Button
                mode="contained"
                onPress={() => {
                    console.log('Submit workout data:', workoutData);
                    // Save workout data to Firebase here
                }}
            >
                Submit
            </Button>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 8,
    },
    card: {
        marginBottom: 16,
    },
    video: {
        alignSelf: 'center',
        width: '100%',
        height: 200,
    },
    input: {
        marginBottom: 16,
        backgroundColor: 'transparent',
    },
});

export default WorkoutViewScreen;
