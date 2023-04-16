import React, {useState, useEffect} from 'react';
import {View, StyleSheet} from 'react-native';
import {Card, Title, Paragraph, ProgressBar, Text} from 'react-native-paper';
import {Grid, LineChart} from "react-native-svg-charts";

const HomeScreen = () => {
    const [calculatedMax, setCalculatedMax] = useState(0);
    const [totalWeightLift, setTotalWeightLift] = useState(0);
    const [totalReps, setTotalReps] = useState(0);

    useEffect(() => {
        // Fetch data from Firebase and update state variables here.
        // For now, we'll use dummy data
        setCalculatedMax(250);
        setTotalWeightLift(15000);
        setTotalReps(200);
    }, []);

    // Dummy data for the chart
    const chartData = [50, 100, 150, 200, 250];

    return (
        <View style={styles.container}>
            <Card style={styles.card}>
                <Card.Content>
                    <Title>Calculated Max</Title>
                    <Paragraph>{calculatedMax} lbs</Paragraph>
                </Card.Content>
            </Card>

            <Card style={styles.card}>
                <Card.Content>
                    <Title>Total Weight Lift</Title>
                    <Paragraph>{totalWeightLift} lbs</Paragraph>
                </Card.Content>
            </Card>

            <Card style={styles.card}>
                <Card.Content>
                    <Title>Total Reps</Title>
                    <Paragraph>{totalReps} reps</Paragraph>
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
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 8,
    },
    card: {
        marginBottom: 16,
    },
});

export default HomeScreen;
