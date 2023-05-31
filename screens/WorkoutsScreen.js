import React, {useState, useEffect, useContext} from 'react';
import {View, StyleSheet, TouchableOpacity, FlatList} from 'react-native';
import {Text, Caption, Surface, Modal, Portal, Button, Card, IconButton, ProgressBar} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import {Picker} from '@react-native-picker/picker';
import DropDownPicker from 'react-native-dropdown-picker';
import {auth, db} from "../config/firebaseConfig";
import WorkoutContext from "../context/WorkoutContext";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {LinearGradient} from 'expo-linear-gradient';


const WorkoutsScreen = () => {
    const navigation = useNavigation();
    const {emphasis, setEmphasis, week, setWeek} = useContext(WorkoutContext);
    const [workoutPlan, setWorkoutPlan] = useState([]);
    const [visible, setVisible] = useState(false);
    const [selectedDay, setSelectedDay] = useState(null);
    const [openWeekPicker, setOpenWeekPicker] = useState(false);
    const [weekPickerValue, setWeekPickerValue] = useState(week);
    const [refresh, setRefresh] = useState(false);
    const [workoutData, setWorkoutData] = useState([]);


    useEffect(() => {
        //console.log("Emphasis: ", emphasis, "Week: ", week);
        fetchWorkouts(week);
    }, [week]);


    const fetchWorkouts = async (week) => {
        let emphasis = "4x - Phase 1";
        if (week > 6 && week <= 10) {
            emphasis = "4x - Phase 2";
        } else if (week > 10) {
            emphasis = "4x - Phase 3";
        }
        setEmphasis(emphasis);
        const weekSnapshot = await db
            .collection("users")
            .doc(auth.currentUser.uid)
            .collection("PushPullLegs")
            .doc(emphasis)
            .collection(`Week ${week}`)
            .get();

        const workoutData = [];

        weekSnapshot.forEach((daySnapshot) => {
            const dayData = {
                day: daySnapshot.id,
                exercises: [],
            };
            console.log("Day: ", daySnapshot.id, "Exercises: ", ",Week:", week)

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
        setWorkoutData(workoutData);
    };

    const handleDayPress = (dayId) => {
        navigation.navigate('WorkoutViewScreen', {dayId, week, emphasis});
    };

    const renderPreview = ({item}) => {
        if (item === undefined) {
            return null;
        }
        let totalVolume = 0;
        item.exercises.forEach((exercise) => {
            // console.log("Exercise: ", exercise);
            let workingSets = parseInt(exercise['Working Sets']);
            let reps = exercise['Reps'];
            // Check if reps is of type string
            if (typeof reps === 'string') {
                // Check if reps contains '-'
                if (reps.includes('-')) {
                    // Get the number of reps
                    reps = reps.split('-')[1];
                }
            }
            // Convert to number
            reps = parseInt(reps);
            if (isNaN(reps)) {
                reps = 0;
            }
            if (isNaN(workingSets)) {
                workingSets = 0;
            }
            //console.log("Working Sets: ", workingSets, "Reps: ", reps);
            totalVolume += workingSets * reps;
        });
        console.log("Total Volume: ", totalVolume + ", Day: ", item.day);
        return (
            <TouchableOpacity onPress={() => handleDayPress(item.day)} style={styles.card}>
                <LinearGradient
                    colors={['#000000', '#434343']}
                    style={styles.gradientWeek}
                >
                    <Card style={styles.cardContent}>
                        <Card.Content>
                            <View style={styles.cardHeader}>
                                <Text style={styles.dayText}>{item.day}</Text>
                                <MaterialCommunityIcons name="dumbbell" size={24} color="#FFD700"/>
                            </View>
                            <Caption style={styles.caption}>{item.emphasis}</Caption>
                            {totalVolume > 0 ? (
                                <>
                                    <Caption style={styles.caption}>Total Volume: {totalVolume}</Caption>
                                    <ProgressBar progress={totalVolume / 1000} color="#FFD700"/>
                                </>
                            ) : null}
                        </Card.Content>
                    </Card>
                </LinearGradient>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#000000', '#434343']}
                style={styles.gradient}
            >
                <View style={styles.pickerContainer}>
                    <Text style={styles.pickerLabel}>Week:</Text>
                    <DropDownPicker
                        items={[
                            {label: 'Week 1', value: 1},
                            {label: 'Week 2', value: 2},
                            {label: 'Week 3', value: 3},
                            {label: 'Week 4', value: 4},
                            {label: 'Week 5', value: 5},
                            {label: 'Week 6', value: 6},
                            {label: 'Week 7', value: 7},
                            {label: 'Week 8', value: 8},
                            {label: 'Week 9', value: 9},
                            {label: 'Week 10', value: 10},
                            {label: 'Week 11', value: 11},
                            {label: 'Week 12', value: 12},
                            {label: 'Week 13', value: 13},
                        ]}
                        defaultValue={week}
                        containerStyle={styles.dropdownContainer}
                        style={styles.dropdown}
                        itemStyle={styles.dropdownItem}
                        labelStyle={styles.dropdownLabel}
                        dropDownStyle={styles.dropDown}
                        onSelectItem={(item) => {
                            setWeek(item.value);
                            setOpenWeekPicker(false);
                            setRefresh(!refresh);
                        }}
                        open={openWeekPicker}
                        setOpen={setOpenWeekPicker}
                        setValue={setWeekPickerValue}
                        value={weekPickerValue}
                    />
                </View>

                <FlatList
                    data={workoutPlan}
                    renderItem={renderPreview}
                    keyExtractor={(day) => day.day}
                    contentContainerStyle={styles.flatListContent}
                    extraData={refresh}
                />
            </LinearGradient>
        </View>

    );

};

const styles = StyleSheet.create({
    pickerWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    picker: {
        width: 120,
    },
    card: {
        flex: 1,
        padding: 8,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    cardContent: {
        backgroundColor: 'transparent',
    },
    dayText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#FFD700',
    },
    caption: {
        color: '#FFFFFF',
    },
    container: {
        flex: 1,
    },
    gradient: {
        flex: 1,
        padding: 8,
    },
    pickerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        zIndex: 2,
    },
    pickerLabel: {
        marginRight: 8,
        color: '#FFD700',
    },
    dropdownContainer: {
        height: 40,
        width: '75%',
        zIndex: 2,
    },
    dropdown: {
        backgroundColor: '#fafafa',
    },
    dropdownItem: {
        justifyContent: 'flex-start',
    },
    dropdownLabel: {
        fontSize: 14,
        textAlign: 'left',
        color: '#000000',
    },
    dropDown: {
        backgroundColor: '#fafafa',
    },
    flatListContent: {
        flexGrow: 1,
        justifyContent: 'center',
        zIndex: -1,
    },
    gradientWeek: {
        flex: 1,
        justifyContent: 'center',
        borderRadius: 15,
        margin: 10,
    },
});


export default WorkoutsScreen;
