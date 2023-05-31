import React, {useState, useEffect} from 'react';
import {View, StyleSheet, Image, ActivityIndicator} from 'react-native';
import {Card, Title, Paragraph, Button, ProgressBar} from 'react-native-paper';
import {LinearGradient} from 'expo-linear-gradient';
import {db, auth} from "../config/firebaseConfig";

const ProfileScreen = () => {
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        const userSnapshot = await db.collection("users").doc(auth.currentUser.uid).get();
        setUserData(userSnapshot.data());
    }
    return (
        <View style={styles.container}>
            {userData ? (
                    <LinearGradient
                        colors={['#000000', '#434343']}
                        style={styles.gradient}
                    >
                        <View style={styles.profileHeader}>
                            <Image
                                style={styles.profileImage}
                                source={{uri: userData.avatar ? userData.avatar : "https://www.pngitem.com/pimgs/m/30-307416_profile-icon-png-image-free-download-searchpng-employee.png"}}
                            />
                            <Title style={styles.title}>{userData.name}</Title>
                        </View>

                        <Card style={styles.card}>
                            <Card.Content>
                                <Title style={styles.title}>Workout Stats</Title>
                                <Paragraph style={styles.paragraph}>Total Reps
                                    Completed: {userData.totalRepsDone}</Paragraph>
                                <Paragraph style={styles.paragraph}>Total Weight
                                    Lifted: {userData.totalWeightLifted} lbs</Paragraph>
                            </Card.Content>
                        </Card>

                        <View style={styles.buttonContainer}>
                            <Button mode="contained" style={styles.button} onPress={() => console.log('Pressed')}>
                                View Workout History
                            </Button>
                            <Button mode="contained" style={styles.button} onPress={() => console.log('Pressed')}>
                                Set Goals
                            </Button>
                            <Button mode="contained" style={styles.button} onPress={() => console.log('Pressed')}>
                                Settings
                            </Button>
                        </View>
                    </LinearGradient>
                ) :
                <View style={styles.container}>
                    <ActivityIndicator size="large" color="#FFD700" style={styles.activityIndicator}/>
                </View>
            }
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
    profileHeader: {
        alignItems: 'center',
        marginBottom: 16,
    },
    profileImage: {
        width: 150,
        height: 150,
        borderRadius: 75,
        marginBottom: 8,
    },
    title: {
        color: '#FFD700',
    },
    paragraph: {
        color: '#FFFFFF',
    },
    card: {
        marginBottom: 16,
        backgroundColor: '#434343',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    button: {
        flex: 1,
        margin: 8,
        backgroundColor: '#FFD700',
    }, activityIndicator: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: 80
    }
});

export default ProfileScreen;
