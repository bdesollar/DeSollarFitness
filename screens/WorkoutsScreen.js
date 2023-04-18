import React, {useState, useEffect, useContext} from 'react';
import {View, StyleSheet, TouchableOpacity, ScrollView, FlatList} from 'react-native';
import {Text, Caption, Surface, Modal, Portal, Provider} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import {Picker} from '@react-native-picker/picker';
import {auth, db} from '../config/firebaseConfig';
import WorkoutContext from '../context/WorkoutContext';
import {addRepsCompletedToExercises} from '../helperFunctions/firebaseCalls';

const WorkoutsScreen = () => {
    const navigation = useNavigation();
    const {emphasis, setEmphasis, week, setWeek} = useContext(WorkoutContext);
    const [workoutPlan, setWorkoutPlan] = useState([]);
    const [visible, setVisible] = useState(false);
    const [selectedDay, setSelectedDay] = useState(null);

    useEffect(() => {
        fetchWorkouts(emphasis, week);
    }, [emphasis, week]);

    const fetchWorkouts = async (emphasis, week) => {
        const weekSnapshot = await db
            .collection("workouts")
            .doc(emphasis)
            .collection(`Week ${week}`)
            .get();

        const workoutData = [];

        weekSnapshot.forEach((daySnapshot) => {
            const dayData = {
                day: daySnapshot.id,
                exercises: [],
            };
            console.log(daySnapshot.id);

            daySnapshot.ref
                .collection("exercises")
                .get()
                .then((exerciseSnapshot) => {
                    exerciseSnapshot.forEach((exerciseDoc) => {
                        const exerciseData = exerciseDoc.data();
                        const data = {
                            ...exerciseData,
                            id: exerciseDoc.id,
                        };
                        dayData.exercises.push(data);
                    });

                    workoutData.push(dayData);

                    if (workoutData.length === weekSnapshot.size) {
                        setWorkoutPlan(workoutData);
                    }
                });
        });
    };

    const handleDayPress = (dayId) => {
        navigation.navigate('WorkoutViewScreen', {dayId});
    };

    const renderPreview = ({item}) => {
        if (!item) {
            return (
                <View>
                    <Text>Loading...</Text>
                </View>
            );
        }

        return (
            <TouchableOpacity
                style={styles.dayContainer}
                onPress={() => handleDayPress(item.day)}
                onLongPress={() => {
                    setSelectedDay(item);
                    showModal();
                }}
            >
                <Surface style={styles.surface}>
                    <Text style={styles.dayText}>{item.day}</Text>
                </Surface>
            </TouchableOpacity>
        );
    };

    const showModal = (day) => {
        setSelectedDay(day);
        setVisible(true);
    };
    const hideModal = () => setVisible(false);

    return (
        <View style={styles.container}>
            <View style={styles.pickerContainer}>
                <View>
                    <Text>Emphasis:</Text>
                    <Picker
                        selectedValue={emphasis}
                        onValueChange={(itemValue) => setEmphasis(itemValue)}
                    >
                        {/* Add Picker.Item for each emphasis */}
                        <Picker.Item label="4x - Phase 1" value="4x - Phase 1"/>
                        <Picker.Item label="4x - Phase 2" value="4x - Phase 2"/>
                        <Picker.Item label="4x - Phase 3" value="4x - Phase 3"/>
                    </Picker>
                </View>

                <View>
                    <Text>Week:</Text>
                    <Picker
                        selectedValue={week}
                        onValueChange={(itemValue) => setWeek(itemValue)}
                    >
                        {/* Add Picker.Item for each week */}
                        <Picker.Item label="Week 1" value={1}/>
                        <Picker.Item label="Week 2" value={2}/>
                        <Picker.Item label="Week 3" value={3}/>
                        <Picker.Item label="Week 4" value={4}/>
                    </Picker>
                </View>
            </View>

            <View style={styles.flatListContainer}>
                <FlatList
                    data={workoutPlan}
                    renderItem={renderPreview}
                    keyExtractor={(day) => day.day}
                    contentContainerStyle={styles.flatListContent}
                    numColumns={2}
                    key="two-columns"
                />
            </View>
        </View>
    );

};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 8
    },
    pickerWrapper: {
        width: '48%',
    },
    picker: {
        height: 50,
        width: '100%',
    },
    flatListContent: {
        justifyContent: 'space-around',
    },
    surface: {
        padding: 8,
        height: 150,
        width: '48%',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 4,
        borderRadius: 4,
        marginBottom: 16,
    },
    dayText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    exerciseContainer: {
        justifyContent: 'center',
    },
    modal: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    modalExercise: {
        marginBottom: 10,
    },
    pickerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 16,
    },
    flatListContainer: {
        flex: 1,
    },
});

export default WorkoutsScreen;
