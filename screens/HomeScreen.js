import React, {useState, useEffect} from 'react';
import {View, StyleSheet, ScrollView} from 'react-native';
import {Card, Title, Paragraph, ProgressBar, Text} from 'react-native-paper';
import {Grid, LineChart} from "react-native-svg-charts";
import {auth, db} from "../config/firebaseConfig";

const HomeScreen = () => {
    const [calculatedMax, setCalculatedMax] = useState(0);
    const [totalWeightLift, setTotalWeightLift] = useState(0);
    const [totalReps, setTotalReps] = useState(0);
    const [allWorkoutData, setAllWorkoutData] = useState([]);
    const [totalWeightLifted, setTotalWeightLifted] = useState(0);
    const [totalRepsDone, setTotalRepsDone] = useState(0);
    const [oneRepMaxes, setOneRepMaxes] = useState(() => ({
        squat: 0,
        bench: 0,
        deadlift: 0,
        overheadPress: 0,
    }));

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        console.log("Maxes: ", oneRepMaxes);
    }, [oneRepMaxes]);

    const fetchData = async () => {
        const maxesData = await fetchMaxes();
        await fetchAllWorkouts(maxesData);
    };
    const fetchMaxes = async () => {
        const maxesRef = await db.collection("users").doc(auth.currentUser.uid).get();
        const maxesData = maxesRef.data().maxes;
        console.log(maxesData);
        return maxesData;

    }

    const fetchAllWorkouts = async () => {
        const workoutSnapshot = await db.collection("workouts").get();
        const workoutDataArray = [];
        let totalWeightLifted = 0;
        let totalRepsDone = 0;
        for (const emphasisDoc of workoutSnapshot.docs) {
            const emphasis = emphasisDoc.id;
            let weeks = 4;
            let weeksInPhase = 1;
            if (emphasis === "4x - Phase 1") {
                weeks = 6
            } else if (emphasis === "4x - Phase 2") {
                weeksInPhase = 7;
                weeks = 10;
            } else if (emphasis === "4x - Phase 3") {
                weeksInPhase = 11;
                weeks = 13;
            }
            for (let week = weeksInPhase; week <= weeks; week++) {
                const weekSnapshot = await db
                    .collection("workouts")
                    .doc(emphasis)
                    .collection(`Week ${week}`)
                    .get();
                for (const dayDoc of weekSnapshot.docs) {
                    const dayId = dayDoc.id;
                    const exercisesSnapshot = await db
                        .collection("workouts")
                        .doc(emphasis)
                        .collection(`Week ${week}`)
                        .doc(dayId)
                        .collection("exercises")
                        .get();

                    exercisesSnapshot.forEach((exerciseDoc) => {
                        const exerciseData = exerciseDoc.data();
                        workoutDataArray.push(exerciseData);

                        if (
                            exerciseData.Exercise.includes("Squat") ||
                            exerciseData.Exercise.includes("Bench") ||
                            exerciseData.Exercise.includes("Deadlift")
                        ) {
                            let exercise = exerciseData.Exercise;
                            if (exerciseData.Exercise.includes("Squat")) {
                                exercise = "squat";
                            } else if (exerciseData.Exercise.includes("Bench")) {
                                exercise = "bench";
                            } else if (exerciseData.Exercise.includes("Deadlift")) {
                                exercise = "deadlift";
                            }
                            if (exerciseData.Load && exerciseData.repsDone) {
                                updateMaxes(
                                    exercise,
                                    exerciseData.Load,
                                    exerciseData.repsDone
                                );
                                console.log("Updating maxes for ", exercise);
                                console.log("Maxes after update: ", oneRepMaxes);
                            }
                        }
                        if (exerciseData.repsDone % 1 === 0) {
                            // Convert to a number from a string
                            exerciseData.repsDone = Number(exerciseData.repsDone);
                            totalRepsDone += exerciseData.repsDone;
                        }
                        // Check if the load is an float or an int
                        if (exerciseData.Load % 1 === 0) {
                            // Convert to a number from a string
                            exerciseData.Load = Number(exerciseData.Load);
                            totalWeightLifted += exerciseData.Load;
                        }
                    });
                }
            }
        }
        setTotalRepsDone(totalRepsDone);
        setTotalWeightLifted(totalWeightLifted);
        setAllWorkoutData(workoutDataArray);
        console.log("Maxes: ", oneRepMaxes);
    };


    const epleyFormula = (weight, reps, exercise) => {
        const max = weight * (1 + reps / 30);
        if (max > oneRepMaxes[exercise]) {
            return max;
        } else {
            return oneRepMaxes[exercise];
        }
    };

    const updateMaxes = (exercise, weight, reps) => {
        const newMax = epleyFormula(weight, reps, exercise);
        console.log("New max: ", newMax);

        setOneRepMaxes((prevMaxes) => {
            const currentMax = prevMaxes[exercise] || 0;

            if (newMax > currentMax) {
                console.log("Updating maxes for ", exercise, " to ", newMax, " lbs");
                return {...prevMaxes, [exercise]: newMax};
            } else {
                return prevMaxes;
            }
        });
    };

    // Dummy data for the chart
    const chartData = [50, 100, 150, 200, 250];

    return (
        <ScrollView style={styles.container}>
            <Card style={styles.card}>
                <Card.Content>
                    <Title>Calculated Max for Squat</Title>
                    <Paragraph>{oneRepMaxes['squat']} lbs</Paragraph>
                </Card.Content>
                <Card.Content>
                    <Title>Calculated Max for Bench</Title>
                    <Paragraph>{oneRepMaxes['bench']} lbs</Paragraph>
                </Card.Content>
                <Card.Content>
                    <Title>Calculated Max for Deadlift</Title>
                    <Paragraph>{oneRepMaxes['deadlift']} lbs</Paragraph>
                </Card.Content>
                <Card.Content>
                    <Title>Calculated Max for Overhead Press</Title>
                    <Paragraph>{oneRepMaxes['overheadPress']} lbs</Paragraph>
                </Card.Content>
            </Card>

            <Card style={styles.card}>
                <Card.Content>
                    <Title>Total Weight Lifted</Title>
                    <Paragraph>{totalWeightLifted} lbs</Paragraph>
                </Card.Content>
            </Card>

            <Card style={styles.card}>
                <Card.Content>
                    <Title>Total Reps Completed</Title>
                    <Paragraph>{totalRepsDone} reps</Paragraph>
                </Card.Content>
            </Card>

            <Card style={styles.card}>
                <Card.Content>
                    <Title>Progress</Title>
                    <LineChart
                        style={{height: 200}}
                        data={chartData}
                        svg={{stroke: 'rgb(134, 65, 244)'}}
                        contentInset={{top: 20, bottom: 20}}
                    >
                        <Grid/>
                    </LineChart>
                </Card.Content>
            </Card>
        </ScrollView>
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
});

export default HomeScreen;
