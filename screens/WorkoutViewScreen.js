import React, {useState, useEffect} from 'react';
import {View, StyleSheet, FlatList} from 'react-native';
import {Card, Title, Paragraph, TextInput, Button} from 'react-native-paper';
import {WebView} from 'react-native-webview';
import {auth, db} from "../config/firebaseConfig";
import {updateData} from "../helperFunctions/firebaseCalls";

const WorkoutViewScreen = ({route}) => {
    const [workoutData, setWorkoutData] = useState([]);
    const [workoutName, setWorkoutName] = useState('');
    const {dayId, week, emphasis} = route.params;

    useEffect(() => {
        fetchWorkoutData();
    }, []);

    const fetchWorkoutData = async () => {
        const workoutSnapshot = await db
            .collection("users")
            .doc(auth.currentUser.uid)
            .collection("PushPullLegs")
            .doc(emphasis)
            .collection(`Week ${week}`)
            .doc(dayId)
            .collection("exercises").orderBy("servertime", "asc")
            .get();

        const workoutDataArray = [];
        workoutSnapshot.forEach((exerciseDoc) => {
            const exerciseData = exerciseDoc.data();
            const data = {
                ...exerciseData,
                id: exerciseDoc.id,
            };
            workoutDataArray.push(data);
        });
        setWorkoutData(workoutDataArray);
    };


    const updateWeight = async (id, value) => {
        setWorkoutData(
            workoutData.map((item) => (item.id === id ? {...item, Load: value} : item))
        );
        await updateData("workouts", emphasis, `Week ${week}`, dayId, id, {
                Load: value,
            }
        );
    };

    const updateReps = async (id, value) => {
        let intValue = parseInt(value);
        if (isNaN(intValue)) {
            intValue = 0;
        }

        console.log("ID: ", id, "Value: ", intValue);
        setWorkoutData(
            workoutData.map((item) => (item.id === id ? {...item, repsDone: intValue} : item))
        );

        console.log("Updating reps with value:", intValue); // Add this line
        await updateData("workouts", emphasis, `Week ${week}`, dayId, id, {
            repsDone: intValue,
        });
    };


    async function updateNotes(id, value) {
        await updateData("workouts", emphasis, `Week ${week}`, dayId, id, {
            exerciseNotes: value,
        })
    }

    const renderItem = ({item}) => {
        //console.log(item);

        return (
            <Card style={styles.card}>
                <Card.Content>
                    <Title style={styles.cardTitle}>{item.Exercise}</Title>
                    <WebView
                        style={styles.video}
                        source={{uri: item.exerciseLink}}
                        allowsInlineMediaPlayback={true}
                        javaScriptEnabled={true}
                    />
                    <Paragraph>Warm-Up Sets: {item['Warm-up Sets']}</Paragraph>
                    <Paragraph>Working Sets: {item['Working Sets']} sets</Paragraph>
                    <Paragraph>Reps: {item['Reps']}</Paragraph>
                    <TextInput
                        label="Weight"
                        value={String(item.Load)}
                        onChangeText={(value) => updateWeight(item.id, value)}
                        style={styles.input}
                    />
                    <TextInput
                        label="Reps Done"
                        value={String(item.repsDone)}
                        onChangeText={(value) => updateReps(item["id"], value)}
                        style={styles.input}
                    />
                    <TextInput
                        label="Notes"
                        value={item.notes}
                        onChangeText={(value) => updateNotes(item.id, value)}
                        style={styles.input}
                    />
                </Card.Content>
            </Card>
        );
    };

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
                    console.log("Submit workout data:", workoutData);
                    // Save workout data to Firebase here
                }}
                style={styles.submitButton}
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
        backgroundColor: "#f0f0f0",
    },
    card: {
        marginBottom: 16,
        backgroundColor: "#ffffff",
        borderRadius: 10,
        elevation: 5,
    },
    cardTitle: {
        color: "#1e88e5",
    },
    video: {
        alignSelf: "center",
        width: "100%",
        height: 200,
        borderRadius: 10,
        overflow: "hidden",
    },
    input: {
        marginBottom: 16,
        backgroundColor: "transparent",
        borderRadius: 5,
        borderColor: "#1e88e5",
    },
    submitButton: {
        marginTop: 10,
        backgroundColor: "#1e88e5",
    },
});

export default WorkoutViewScreen;
