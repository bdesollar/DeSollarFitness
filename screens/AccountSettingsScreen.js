import React, {useEffect, useState} from 'react';
import {View, StyleSheet, Alert, Platform, PermissionsAndroid, Image, ScrollView} from 'react-native';
import {TextInput, Button, Text, Title, Caption, ProgressBar} from 'react-native-paper';
import {auth, db, storage} from '../config/firebaseConfig';
import {updateUserData} from '../helperFunctions/firebaseCalls';
import * as ImagePicker from 'expo-image-picker';
import {manipulateAsync} from 'expo-image-manipulator';
import * as ImageManipulator from 'expo-image-manipulator';

const AccountSettingsScreen = ({navigation}) => {
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [avatar, setAvatar] = useState(null);
    const [coverPhoto, setCoverPhoto] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);

    useEffect(() => {
            const unsubscribe = db.collection('users').doc(auth.currentUser.uid).onSnapshot((doc) => {
                setBio(doc.data().bio);
                setName(doc.data().name);
                setPhoneNumber(doc.data().phoneNumber);
            });
            return () => unsubscribe();
        }
        , []);

    const handleSave = async () => {
        // Save the updated name, bio, and phone number to your backend or Firebase.
        const data = {
            name,
            bio,
            phoneNumber,
        };
        await updateUserData(auth.currentUser.uid, data);
        // Upload avatar and cover photo
        if (avatar) {
            await uploadImage('avatar', avatar);
        }
        if (coverPhoto) {
            await uploadImage('coverPhoto', coverPhoto);
        }

        Alert.alert('Account Settings', 'Your account settings have been saved.');
    };

    const requestPermission = async () => {
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.CAMERA_ROLL,
                );
                return granted === PermissionsAndroid.RESULTS.GRANTED;
            } catch (err) {
                console.warn(err);
                return false;
            }
        } else {
            return true;
        }
    };

    const pickImage = async (type) => {
        const hasPermission = await requestPermission();
        if (!hasPermission) {
            Alert.alert('Permission required', 'Please grant access to camera roll.');
            return;
        }

        const options = {
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
            resize: {width: 500, height: 500},
            base64: true, // optionally, if you want to get the base64-encoded string of the image
        }

        await ImagePicker.launchImageLibraryAsync(options)
            .then(response => {
                if (response.canceled) {
                    console.log('User cancelled image picker');
                } else {
                    const source = response.assets[0].uri;
                    console.log("Source: " + source);
                    if (type === 'avatar') {
                        setAvatar(source);
                    } else if (type === 'coverPhoto') {
                        setCoverPhoto(source);
                    }
                }
            })
            .catch(e => console.log(e));
    };

    const uploadImage = async (type, uri) => {
        const manipulatedImage = await manipulateAsync(
            uri,
            [{resize: {width: 500}}],
            {
                compress: 1,
                format: ImageManipulator.SaveFormat.JPEG,
            },
        );
        const response = await fetch(manipulatedImage.uri);
        const blob = await response.blob();
        const uploadTask = storage
            .ref(`images/${auth.currentUser.uid}/${type}`)
            .put(blob);

        uploadTask.on(
            'state_changed',
            (snapshot) => {
                const progress = snapshot.bytesTransferred / snapshot.totalBytes;
                setUploadProgress(progress);
            },
            (error) => {
                console.log(error);
            },
            async () => {
                const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
                await updateUserData(auth.currentUser.uid, {[type]: downloadURL});
                setUploadProgress(0);
            },
        );
    };

    return (
        <ScrollView style={styles.scroll}>
            <View style={styles.container}>
                <TextInput
                    label="Name"
                    value={name}
                    onChangeText={setName}
                    style={styles.input}
                    mode="outlined"
                />
                <TextInput
                    label="Bio"
                    value={bio}
                    onChangeText={setBio}
                    style={styles.input}
                    mode="outlined"
                    multiline
                />
                <TextInput
                    label="Phone Number"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    style={styles.input}
                    mode="outlined"
                    keyboardType="phone-pad"
                />
                {avatar && (
                    <View style={styles.imageContainer}>
                        <Text style={styles.imageLabel}>Avatar Preview:</Text>
                        <Image source={{uri: avatar}} style={styles.avatar}/>
                    </View>
                )}
                <Button
                    mode="outlined"
                    onPress={() => pickImage('avatar')}
                    style={styles.imageButton}
                >
                    Change Avatar
                </Button>
                {coverPhoto && (
                    <View style={styles.imageContainer}>
                        <Text style={styles.imageLabel}>Cover Photo Preview:</Text>
                        <Image source={{uri: coverPhoto}} style={styles.coverPhoto}/>
                    </View>
                )}
                <Button
                    mode="outlined"
                    onPress={() => pickImage('coverPhoto')}
                    style={styles.imageButton}
                >
                    Change Cover Photo
                </Button>
                <ProgressBar
                    progress={uploadProgress}
                    style={styles.progressBar}
                    visible={uploadProgress > 0}
                />
                <Caption style={styles.progressCaption}>
                    {uploadProgress > 0 ? `Uploading... ${Math.round(uploadProgress * 100)}%` : ''}
                </Caption>
                <Button mode="contained" onPress={handleSave} style={styles.saveButton}>
                    Save
                </Button>
                <Text style={styles.text}>Change Password</Text>
                <Button
                    mode="text"
                    onPress={() => navigation.navigate('ChangePassword')}
                    style={styles.changePasswordButton}
                >
                    Change Password
                </Button>
            </View>
        </ScrollView>
    );

};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginTop: 20,
    },
    title: {
        marginBottom: 20,
    },
    input: {
        width: '100%',
        marginBottom: 20,
    },
    saveButton: {
        marginBottom: 20,
    },
    text: {
        fontSize: 18,
        marginBottom: 10,
    },
    changePasswordButton: {
        marginTop: 10,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 10,
    },
    coverPhoto: {
        width: '100%',
        height: 150,
        marginBottom: 10,
    },
    imageContainer: {
        width: '100%',
        marginBottom: 20,
        alignItems: 'center',
    },
    imageLabel: {
        fontSize: 18,
        marginBottom: 5,
    },
    imageButton: {
        marginBottom: 20,
    },
    progressBar: {
        width: '100%',
        marginBottom: 5,
    },
    progressCaption: {
        marginBottom: 20,
    },
    scroll: {
        flex: 1,
        backgroundColor: '#fff',
    }
});

export default AccountSettingsScreen;
