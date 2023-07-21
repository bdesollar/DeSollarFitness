import React, {useState, useEffect} from 'react';
import {View, StyleSheet, ScrollView, ActivityIndicator} from 'react-native';
import {Card, Title, Paragraph, ProgressBar, Text} from 'react-native-paper';
import {Grid, LineChart} from "react-native-svg-charts";
import {auth, db} from "../config/firebaseConfig";
import {copyWorkoutsToUser, saveDataToSQLite} from "../helperFunctions/firebaseCalls";
import {VictoryLine, VictoryChart, VictoryAxis, VictoryTheme, VictoryScatter, VictoryLabel} from 'victory-native';
import * as SQLite from "expo-sqlite";
import * as FileSystem from 'expo-file-system';


const HomeScreen = () => {
    const [allWorkoutData, setAllWorkoutData] = useState([]);
    const [totalWeightLifted, setTotalWeightLifted] = useState(0);
    const [totalRepsDone, setTotalRepsDone] = useState(0);
    const [oneRepMaxes, setOneRepMaxes] = useState(() => ({
        squat: 0,
        bench: 0,
        deadlift: 0,
        overheadPress: 0,
    }));
    const [workoutHistory, setWorkoutHistory] = useState([]);
    const [workoutHistoryData, setWorkoutHistoryData] = useState(() => (
        {
            squat: [],
            bench: [],
            deadlift: [],
            overheadPress: [],
        }
    ));


    useEffect(() => {
        let unsubscribe;
        fetchData().then(unsub => {
            unsubscribe = unsub;
        });

        // Clean up on component unmount
        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [fetchData]);


    useEffect(() => {
        saveData();
    }, []);

    async function saveData() {
        await saveDataToSQLite();
        console.log("Data saved to SQLite");
        await logSQLiteData();
    }

    async function logSQLiteData() {
        const dbSql = SQLite.openDatabase('db.desollarFitness');

        // Show the path to the SQLite database
        console.log("SQLite database path:", FileSystem.documentDirectory + 'SQLite/db.desollarFitness');

        // Log user data from SQLite
        dbSql.transaction(tx => {
            tx.executeSql('select * from users', [], (_, {rows}) =>
                // console.log('User data in SQLite:', rows._array),
                (_, error) => {
                    console.log('Error logging user data from SQLite:', error);
                    return true; // stops transaction on error
                }
            );
        });

        // Log workout data from SQLite
        dbSql.transaction(tx => {
            tx.executeSql('select * from workouts', [], (_, {rows}) =>
                // console.log('Workout data in SQLite:', rows._array),
                (_, error) => {
                    console.log('Error logging workout data from SQLite:', error);
                    return true; // stops transaction on error
                }
            );
        });

        // Show all the tables in the SQLite database
        dbSql.transaction(tx => {
            tx.executeSql('SELECT name FROM sqlite_master WHERE type="table"', [], (_, {rows}) =>
                // console.log('Tables in SQLite:', rows._array),
                (_, error) => {
                    console.log('Error logging tables in SQLite:', error);
                    return true; // stops transaction on error
                }
            );
        });

        // Log workout history data from SQLite
        dbSql.transaction(tx => {
            tx.executeSql('select * from workoutHistory', [], (_, {rows}) =>
                // console.log('Workout history data in SQLite:', rows._array),
                (_, error) => {
                    console.log('Error logging workout history data from SQLite:', error);
                    return true; // stops transaction on error
                }
            );
        });
    }


    useEffect(() => {
        const oneRepMaxHistory = calculateOneRepMaxHistory(workoutHistory);
        setWorkoutHistoryData(oneRepMaxHistory);
    }, [workoutHistory]);

    const fetchData = async () => {
        const maxesData = await fetchMaxes();
        await fetchAllWorkouts(maxesData);
        const unsubscribe = fetchWorkoutHistory();
        return unsubscribe;
    };


    const fetchWorkoutHistory = () => {
        const workoutHistoryRef = db.collection('workoutHistory');
        const workoutHistoryDoc = workoutHistoryRef.doc(auth.currentUser.uid);

        const unsubscribe = workoutHistoryDoc.onSnapshot((doc) => {
            const workoutHistoryData = doc.data() || {};
            setWorkoutHistory(workoutHistoryData);
        });

        return unsubscribe;
    };


    const calculateOneRepMaxHistory = (workoutHistory) => {
        const oneRepMaxHistory = {
            squat: [],
            bench: [],
            deadlift: [],
            overheadPress: [],
        };

        for (const [date, exercises] of Object.entries(workoutHistory)) {
            for (const exercise of exercises) {
                if (exercise.exerciseId === "Squat" ||
                    exercise.exerciseId === "Bench Press" ||
                    exercise.exerciseId === "Deadlift") {
                    let exerciseName = exercise.exerciseId;
                    if (exercise.exerciseId.includes("Squat")) {
                        exerciseName = "squat";
                    } else if (exercise.exerciseId.includes("Bench")) {
                        exerciseName = "bench";
                    } else if (exercise.exerciseId.includes("Deadlift")) {
                        exerciseName = "deadlift";
                    }
                    let dateParts = date.split("Date: ");
                    let newDate = dateParts[1];
                    const oneRepMax = exercise.weight * (1 + exercise.reps / 30);
                    if (oneRepMax === 0) {
                        continue;
                    }
                    oneRepMaxHistory[exerciseName].push({newDate, oneRepMax});
                }
            }
        }

        return oneRepMaxHistory;
    };


    const fetchMaxes = async () => {
        const maxesRef = await db.collection("users").doc(auth.currentUser.uid).get();
        const maxesData = maxesRef.data().maxes;
        return maxesData;

    }

    const fetchAllWorkouts = async () => {
        const workoutSnapshot = await db.collection("users")
            .doc(auth.currentUser.uid)
            .collection("PushPullLegs").get();
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
                const weekSnapshot = await db.collection("users")
                    .doc(auth.currentUser.uid)
                    .collection("PushPullLegs")
                    .doc(emphasis)
                    .collection(`Week ${week}`)
                    .get();
                for (const dayDoc of weekSnapshot.docs) {
                    const dayId = dayDoc.id;
                    const exercisesSnapshot = await db.collection("users")
                        .doc(auth.currentUser.uid)
                        .collection("PushPullLegs")
                        .doc(emphasis)
                        .collection(`Week ${week}`)
                        .doc(dayId)
                        .collection("exercises")
                        .get();

                    exercisesSnapshot.forEach((exerciseDoc) => {
                        const exerciseData = exerciseDoc.data();
                        workoutDataArray.push(exerciseData);

                        if (
                            exerciseData.Exercise === "Squat" ||
                            exerciseData.Exercise === "Bench Press" ||
                            exerciseData.Exercise === "Deadlift"
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
        await db.collection("users").doc(auth.currentUser.uid).update({
            totalRepsDone: totalRepsDone,
            totalWeightLifted: totalWeightLifted,
        });
        const userRef = await db.collection("users").doc(auth.currentUser.uid).get();
        const userData = userRef.data();
        // Go through each max and only update if it's greater than the current max
        for (const [exercise, max] of Object.entries(oneRepMaxes)) {
            if (max > userData.maxes[exercise]) {
                await db.collection("users").doc(auth.currentUser.uid).update({
                    [`maxes.${exercise}`]: max,
                });
            }
        }
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

        setOneRepMaxes((prevMaxes) => {
            const currentMax = prevMaxes[exercise] || 0;

            if (newMax > currentMax) {
                return {...prevMaxes, [exercise]: newMax};
            } else {
                return prevMaxes;
            }
        });
    };


    return (
        <ScrollView style={styles.container}>
            {allWorkoutData.length > 0 ? (
                    <>
                        <Card style={styles.card}>
                            <Card style={styles.cardContent}>
                                <Card.Content>
                                    <Title style={styles.title}>Progress for Squat</Title>
                                    <VictoryChart>
                                        <VictoryAxis
                                            dependentAxis
                                            label="One Rep Maxes"
                                            style={{
                                                axisLabel: {padding: 37, fill: 'black'},
                                                ticks: {stroke: 'black', size: 5},
                                                grid: {stroke: 'white'},
                                                axis: {stroke: 'black'}
                                            }}
                                            fixLabelOverlap={true}
                                        />
                                        <VictoryAxis
                                            label="Date"
                                            style={{
                                                axisLabel: {padding: 35, fill: 'black'},
                                                ticks: {stroke: 'black', size: 5},
                                                grid: {stroke: 'white'},
                                                axis: {stroke: 'black'}
                                            }}
                                            fixLabelOverlap={true}
                                            tickFormat={(x) => {
                                                const date = new Date(x);
                                                return `${date.getMonth() + 1}/${date.getDate()}`;
                                            }}
                                            tickCount={5}
                                        />
                                        <VictoryScatter
                                            data={workoutHistoryData.squat && workoutHistoryData.squat.map(item => {
                                                let date = new Date(item.newDate);
                                                return {
                                                    date: date,
                                                    oneRepMax: item.oneRepMax
                                                };
                                            }) || []}
                                            x="date"
                                            y="oneRepMax"
                                            size={3}
                                            style={{
                                                data: {fill: 'rgb(245, 195, 17)'},
                                                padding: 30,
                                            }}
                                            line={true}
                                            maxBubbleSize={5}
                                            minBubbleSize={3}
                                            symbol="circle"
                                        />
                                        <VictoryLine
                                            interpolation={"natural"}
                                            style={{
                                                data: {stroke: "rgb(245, 195, 17)"},
                                                parent: {border: "1px solid #ccc"}
                                            }}
                                            data={workoutHistoryData.squat && workoutHistoryData.squat.map(item => {
                                                let date = new Date(item.newDate);
                                                return {
                                                    date: date,
                                                    oneRepMax: item.oneRepMax
                                                };
                                            }) || []}
                                            x="date"
                                            y="oneRepMax"
                                        >
                                            <VictoryLabel
                                                textAnchor="middle"
                                                style={{fontSize: 10}}
                                                x={200}
                                                y={30}
                                                text="Natural"
                                            />
                                        </VictoryLine>
                                    </VictoryChart>
                                </Card.Content>
                            </Card>
                            <Card style={styles.cardContent}>
                                <Card.Content>
                                    <Title style={styles.title}>Progress for Bench</Title>
                                    <VictoryChart>
                                        <VictoryAxis
                                            dependentAxis
                                            label="One Rep Maxes"
                                            style={{
                                                axisLabel: {padding: 37, fill: 'black'},
                                                ticks: {stroke: 'black', size: 5},
                                                grid: {stroke: 'white'},
                                                axis: {stroke: 'black'}
                                            }}
                                            fixLabelOverlap={true}

                                            minDomain={{y: 0}}
                                        />
                                        <VictoryAxis
                                            label="Date"
                                            style={{
                                                axisLabel: {padding: 35, fill: 'black'},
                                                ticks: {stroke: 'black', size: 5},
                                                grid: {stroke: 'white'},
                                                axis: {stroke: 'black'}
                                            }}
                                            fixLabelOverlap={true}
                                            tickFormat={(x) => {
                                                const date = new Date(x);
                                                return `${date.getMonth() + 1}/${date.getDate()}`;
                                            }}
                                            tickCount={5}
                                        />
                                        <VictoryScatter
                                            data={workoutHistoryData.bench && workoutHistoryData.bench.map(item => {
                                                let date = new Date(item.newDate);
                                                return {
                                                    date: date,
                                                    oneRepMax: item.oneRepMax
                                                };
                                            }) || []}
                                            x="date"
                                            y="oneRepMax"
                                            size={3}
                                            style={{
                                                data: {fill: 'rgb(245, 195, 17)'},
                                                padding: 30,
                                            }}
                                            bubbleProperty="oneRepMax"
                                            maxBubbleSize={5}
                                            minBubbleSize={3}
                                            symbol="circle"
                                        />
                                        <VictoryLine
                                            style={{
                                                data: {stroke: "rgb(245, 195, 17)"},
                                                parent: {border: "1px solid #ccc"}
                                            }}
                                            data={workoutHistoryData.bench && workoutHistoryData.bench.map(item => {
                                                console.log(item);
                                                let date = new Date(item.newDate);
                                                return {
                                                    date: date,
                                                    oneRepMax: item.oneRepMax
                                                };
                                            }) || []}
                                            x="date"
                                            y="oneRepMax"
                                        >
                                            <VictoryLabel
                                                textAnchor="middle"
                                                style={{fontSize: 10}}
                                                x={200}
                                                y={30}
                                                text="Natural"
                                            />
                                        </VictoryLine>
                                    </VictoryChart>
                                </Card.Content>
                            </Card>
                            <Card style={styles.cardContent}>
                                <Card.Content>
                                    <Title style={styles.title}>Progress for Deadlift</Title>
                                    <VictoryChart>
                                        <VictoryAxis
                                            dependentAxis
                                            label="One Rep Maxes"
                                            style={{
                                                axisLabel: {padding: 37, fill: 'black'},
                                                ticks: {stroke: 'black', size: 5},
                                                grid: {stroke: 'white'},
                                                axis: {stroke: 'black'}
                                            }}
                                            fixLabelOverlap={true}
                                        />
                                        <VictoryAxis
                                            label="Date"
                                            style={{
                                                axisLabel: {padding: 35, fill: 'black'},
                                                ticks: {stroke: 'black', size: 5},
                                                grid: {stroke: 'white'},
                                                axis: {stroke: 'black'}
                                            }}
                                            fixLabelOverlap={true}
                                            tickFormat={(x) => {
                                                const date = new Date(x);
                                                return `${date.getMonth() + 1}/${date.getDate()}`;
                                            }}
                                            tickCount={5}
                                        />
                                        <VictoryScatter
                                            data={workoutHistoryData.deadlift && workoutHistoryData.deadlift.map(item => {
                                                let date = new Date(item.newDate);
                                                return {
                                                    date: date,
                                                    oneRepMax: item.oneRepMax
                                                };
                                            }) || []}
                                            x="date"
                                            y="oneRepMax"
                                            size={3}
                                            style={{
                                                data: {fill: 'rgb(245, 195, 17)'},
                                                padding: 30,
                                            }}
                                            line={true}
                                            bubbleProperty="oneRepMax"
                                            maxBubbleSize={5}
                                            minBubbleSize={3}
                                            symbol="circle"
                                        />
                                        <VictoryLine
                                            interpolation={"natural"}
                                            style={{
                                                data: {stroke: "rgb(245, 195, 17)"},
                                                parent: {border: "1px solid #ccc"}
                                            }}
                                            data={workoutHistoryData.deadlift && workoutHistoryData.deadlift.map(item => {
                                                let date = new Date(item.newDate);
                                                return {
                                                    date: date,
                                                    oneRepMax: item.oneRepMax
                                                };
                                            }) || []}
                                            x="date"
                                            y="oneRepMax"
                                        >
                                            <VictoryLabel
                                                textAnchor="middle"
                                                style={{fontSize: 10}}
                                                x={200}
                                                y={30}
                                                text="Natural"
                                            />
                                        </VictoryLine>
                                    </VictoryChart>
                                </Card.Content>
                            </Card>
                            <Card style={styles.cardContent}>
                                <Card.Content>
                                    <Title style={styles.title}>Progress for Overhead Press</Title>
                                    <VictoryChart>
                                        <VictoryAxis
                                            dependentAxis
                                            label="One Rep Maxes"
                                            style={{
                                                axisLabel: {padding: 37, fill: 'black'},
                                                ticks: {stroke: 'black', size: 5},
                                                grid: {stroke: 'white'},
                                                axis: {stroke: 'black'}
                                            }}
                                            fixLabelOverlap={true}
                                        />
                                        <VictoryAxis
                                            label="Date"
                                            style={{
                                                axisLabel: {padding: 35, fill: 'black'},
                                                ticks: {stroke: 'black', size: 5},
                                                grid: {stroke: 'white'},
                                                axis: {stroke: 'black'}
                                            }}
                                            fixLabelOverlap={true}
                                            tickFormat={(x) => {
                                                const date = new Date(x);
                                                return `${date.getMonth() + 1}/${date.getDate()}`;
                                            }}
                                            tickCount={5}
                                        />
                                        <VictoryScatter
                                            data={workoutHistoryData.overheadPress && workoutHistoryData.overheadPress.map(item => {
                                                let date = new Date(item.newDate);
                                                return {
                                                    date: date,
                                                    oneRepMax: item.oneRepMax
                                                };
                                            }) || []}
                                            x="date"
                                            y="oneRepMax"
                                            size={3}
                                            style={{
                                                data: {fill: 'rgb(245, 195, 17)'},
                                                padding: 30,
                                            }}
                                            line={true}
                                            bubbleProperty="oneRepMax"
                                            maxBubbleSize={5}
                                            minBubbleSize={3}
                                            symbol="circle"
                                        />
                                        <VictoryLine
                                            interpolation={"natural"}
                                            style={{
                                                data: {stroke: "rgb(245, 195, 17)"},
                                                parent: {border: "1px solid #ccc"}
                                            }}
                                            data={workoutHistoryData.overheadPress && workoutHistoryData.overheadPress.map(item => {
                                                let date = new Date(item.newDate);
                                                return {
                                                    date: date,
                                                    oneRepMax: item.oneRepMax
                                                };
                                            }) || []}
                                            x="date"
                                            y="oneRepMax"
                                        >
                                            <VictoryLabel
                                                textAnchor="middle"
                                                style={{fontSize: 10, fill: 'rgb(245, 195, 17)'}}
                                                x={200}
                                                y={30}
                                                text="Natural"
                                            />
                                        </VictoryLine>
                                    </VictoryChart>
                                </Card.Content>
                            </Card>
                        </Card>

                        <Card style={styles.card}>
                            <Card.Content>
                                <Title style={styles.title}>Total Weight Lifted</Title>
                                <Paragraph style={styles.paragraph}>{totalWeightLifted} lbs</Paragraph>
                            </Card.Content>
                        </Card>

                        <Card style={styles.card}>
                            <Card.Content>
                                <Title style={styles.title}>Total Reps Completed</Title>
                                <Paragraph style={styles.paragraph}>{totalRepsDone} reps</Paragraph>
                            </Card.Content>
                        </Card>
                    </>
                ) :
                (
                    <View style={styles.container}>
                        <ActivityIndicator size="large" color="#FFD700" style={styles.activityIndicator}/>
                    </View>
                )
            }
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 8,
        backgroundColor: '#000000',
    },
    card: {
        marginBottom: 16,
        backgroundColor: '#000000',
    },
    cardContent: {
        backgroundColor: '#434343',
        marginBottom: 16,
    },
    title: {
        color: '#FFD700',
        justifyContent: 'center',
        alignItems: 'center',
    },
    paragraph: {
        color: '#FFFFFF',
    },
    activityIndicator: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: 80
    }
});

export default HomeScreen;
