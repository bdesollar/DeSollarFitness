import React, {useState, useEffect} from 'react';
import {View, StyleSheet, FlatList} from 'react-native';
import {Card, Title, Paragraph, TextInput, Button, Portal, Modal} from 'react-native-paper';
import {WebView} from 'react-native-webview';
import {auth, db} from "../config/firebaseConfig";
import {updateData} from "../helperFunctions/firebaseCalls";

const WorkoutViewScreen = ({route, navigation}) => {
    const [workoutData, setWorkoutData] = useState([]);
    const {dayId, week, emphasis} = route.params;
    const [workoutHistory, setWorkoutHistory] = useState({});
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [exerciseId, setExerciseId] = useState(null);

    useEffect(() => {
        fetchWorkoutData();
    }, []);


    // Fetch workout data and history
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

        // Fetch workout history
        const workoutHistoryRef = db.collection('workoutHistory');
        const workoutHistoryDoc = workoutHistoryRef.doc(auth.currentUser.uid);
        const workoutHistory = (await workoutHistoryDoc.get()).data() || {};
        setWorkoutHistory(workoutHistory);
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
        setWorkoutData(
            workoutData.map((item) => (item.id === id ? {...item, repsDone: value} : item))
        );

        console.log("Updating reps with value:", value); // Add this line
        await updateData("workouts", emphasis, `Week ${week}`, dayId, id, {
            repsDone: value,
        });

    };


    async function updateNotes(id, value) {
        setWorkoutData(
            workoutData.map((item) => (item.id === id ? {...item, notes: value} : item))
        );

        await updateData("workouts", emphasis, `Week ${week}`, dayId, id, {
            exerciseNotes: value,
        })
    }

    const hideHistoryModal = () => setShowHistoryModal(false);

    const showHistoryModalFunction = (id) => {
        console.log("Exercise ID:", id);
        setExerciseId(id);
        setShowHistoryModal(true);
    }

    const renderItem = ({item}) => {
        // Filter workout history to get history for this exercise
        const exerciseHistory = Object.values(workoutHistory)
            .flat()
            .filter(exercise => exercise.exerciseId === item.id);

        return (
            <Card style={styles.card} onLongPress={() => showHistoryModalFunction(item.id)}>
                <Card.Content>
                    <Title style={styles.cardTitle}>{item.Exercise}</Title>
                    <WebView
                        style={styles.video}
                        source={{uri: item.exerciseLink}}
                        allowsInlineMediaPlayback={true}
                        javaScriptEnabled={true}
                    />
                    <Title style={styles.sectionTitle}>Sets and Reps</Title>
                    <Paragraph style={styles.paragraph}>Warm-Up Sets: {item['Warm-up Sets']}</Paragraph>
                    <Paragraph style={styles.paragraph}>Working Sets: {item['Working Sets']} sets</Paragraph>
                    <Paragraph style={styles.paragraph}>Reps: {item['Reps']}</Paragraph>
                    <Title style={styles.sectionTitle}>Options</Title>
                    <Paragraph style={styles.paragraph}>Substitution Option
                        1: {item['Substitution Option 1']}</Paragraph>
                    <Paragraph style={styles.paragraph}>Substitution Option
                        2: {item['Substitution Option 2']}</Paragraph>
                    <Title style={styles.sectionTitle}>Additional Info</Title>
                    <Paragraph style={styles.paragraph}>RPE: {item['RPE']}</Paragraph>
                    <Paragraph style={styles.paragraph}>Rest Time: {item['Rest']}</Paragraph>
                    <Title style={styles.sectionTitle}>Your Performance</Title>
                    <TextInput
                        label="Weight"
                        value={String(item.Load)}
                        onChangeText={(value) => updateWeight(item.id, value)}
                        style={styles.input}
                        autoCapitalize={"none"}
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


    async function updateWorkoutHistory(id) {
        // Get the current workout history
        const workoutHistoryRef = db.collection('workoutHistory');
        const workoutHistoryDocRef = workoutHistoryRef.doc(auth.currentUser.uid);
        const workoutHistoryDoc = await workoutHistoryDocRef.get();
        let workoutHistory = workoutHistoryDoc.data() || {};

        // If the document doesn't exist, create it
        if (!workoutHistoryDoc.exists) {
            await workoutHistoryDocRef.set({});  // This creates a new document with no fields
            workoutHistory = {};
        }
        const today = new Date().toISOString().slice(0, 10);  // Get today's date in YYYY-MM-DD format
        const workoutKey = `${emphasis}, Week: ${week}, Day: ${dayId}, Date: ${today}`;  // Create a key based on the week and day
        workoutHistory[workoutKey] = workoutHistory[workoutKey] || [];
        // if exerciseId is already in workoutHistory, update it, otherwise add it
        if (workoutHistory[workoutKey].find(exercise => exercise.exerciseId === id)) {
            workoutHistory[workoutKey].find(exercise => exercise.exerciseId === id).weight = workoutData.find(item => item.id === id).Load || 0;
            workoutHistory[workoutKey].find(exercise => exercise.exerciseId === id).reps = workoutData.find(item => item.id === id).repsDone || 0;
            workoutHistory[workoutKey].find(exercise => exercise.exerciseId === id).notes = workoutData.find(item => item.id === id).notes || "";
        } else {
            workoutHistory[workoutKey].push({
                exerciseId: id,
                weight: workoutData.find(item => item.id === id).Load || 0,
                reps: workoutData.find(item => item.id === id).repsDone || 0,
                notes: workoutData.find(item => item.id === id).notes || "",
            });
        }
        console.log(`Workout history for ${workoutKey}: `, workoutHistory);
        await workoutHistoryDocRef.set(workoutHistory);
    }


    async function saveWorkout() {
        // Go through each exercise and update the workout history
        for (const exercise of workoutData) {
            // console.log("Updating workout history for exercise:", exercise);
            await updateWorkoutHistory(exercise.id, exercise.repsDone, exercise.Load, exercise.notes);
        }
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={workoutData}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
            />
            <Portal>
                <Modal visible={showHistoryModal} onDismiss={hideHistoryModal}
                       contentContainerStyle={styles.modalContent}>
                    <Title style={styles.modalTitle}>Workout History</Title>
                    {exerciseId && Object.entries(workoutHistory).map(([workoutKey, exercises]) => (
                        exercises.filter(exercise => exercise.exerciseId === exerciseId).map((exercise, index) => (
                            <View style={styles.historyItem} key={index}>
                                <Paragraph style={styles.historyText}>
                                    Workout: {workoutKey}, Weight: {exercise.weight}, Reps: {exercise.reps},
                                    Notes: {exercise.notes}
                                </Paragraph>
                            </View>
                        ))
                    ))}
                </Modal>
            </Portal>
            <Button
                style={styles.button}
                mode="contained"
                icon="check"
                onPress={() => {
                    saveWorkout();
                    navigation.navigate("Workouts");
                }}
            >
                Finish Workout
            </Button>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 8,
        backgroundColor: '#000000',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        margin: 20,
        borderRadius: 10,
    },
    modalTitle: {
        marginBottom: 20,
        fontSize: 24,
        fontWeight: 'bold',
    },
    historyItem: {
        marginBottom: 10,
        padding: 10,
        borderRadius: 5,
        backgroundColor: '#f5f5f5',
    },
    historyText: {
        color: '#333',
    },
    button: {
        margin: 20,
        padding: 10,
        borderRadius: 10,
        backgroundColor: '#FFD700',
    },
    card: {
        margin: 15,
        borderRadius: 10,
        backgroundColor: '#434343',
    },
    cardTitle: {
        color: '#FFD700',
        fontWeight: 'bold',
        fontSize: 20,
    },
    video: {
        alignSelf: 'center',
        width: '100%',
        height: 200,
        borderRadius: 10,
        overflow: 'hidden',
    },
    sectionTitle: {
        color: '#FFD700',
        fontWeight: 'bold',
        fontSize: 18,
        marginTop: 10,
    },
    paragraph: {
        marginBottom: 10,
        color: '#FFFFFF',
    },
    input: {
        marginBottom: 16,
        backgroundColor: 'white',
        color: '#FFFFFF',
    }, inputContent: {
        color: '#FFFFFF',
    }
});


export default WorkoutViewScreen;
