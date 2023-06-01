import React from 'react';
import {DrawerItem} from '@react-navigation/drawer';
import {firebaseApp, auth, db} from '../config/firebaseConfig.js';
import {IconButton} from 'react-native-paper';
import {Alert} from "react-native";

const SignOutButton = () => {
    const handleSignOut = async () => {
        try {
            Alert.alert(
                "Sign Out",
                "Are you sure you want to sign out?",
                [
                    {
                        text: "Cancel",
                        onPress: () => console.log("Cancel Pressed"),
                        style: "cancel"
                    },
                    {text: "OK", onPress: () => auth.signOut()}
                ],
                {cancelable: false}
            );
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return (
        <DrawerItem
            label="Sign Out"
            icon={() => (
                <IconButton name="logout" size={24} color="black" icon={'logout'}/>
            )}
            onPress={handleSignOut}
        />
    );
};

export default SignOutButton;
