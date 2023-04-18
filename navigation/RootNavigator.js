import React, {useEffect, useState} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {Alert, Image} from 'react-native';
import DrawerNavigator from './DrawerNavigator';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import InitialInfoScreen from '../screens/InitialInfoScreen';
import {Text} from "react-native-paper";
import * as SecureStore from "expo-secure-store";
import {auth} from "../config/firebaseConfig";
import WorkoutsScreen from "../screens/WorkoutsScreen";
import WorkoutViewScreen from "../screens/WorkoutViewScreen";

const Stack = createStackNavigator();

const RootNavigator = ({logo}) => {

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [emailVerified, setEmailVerified] = useState(false);

    useEffect(() => {
        const checkAuthentication = async () => {
            const savedUser = await SecureStore.getItemAsync('isAuthenticated');
            setIsAuthenticated(savedUser === 'true');
        };
        checkAuthentication();

        const unsubscribe = auth.onAuthStateChanged(async user => {
            console.log('user', user);
            if (user) {
                setIsAuthenticated(true);
                await SecureStore.setItemAsync('isAuthenticated', 'true');
                setEmailVerified(user.emailVerified);
            } else {
                setIsAuthenticated(false);
                setEmailVerified(false);
                await SecureStore.deleteItemAsync('isAuthenticated');
            }
        });
        return () => unsubscribe();
    }, []);


    return (
        <Stack.Navigator>
            {/*{isAuthenticated && emailVerified ? (*/}
            {isAuthenticated ? (
                <>
                    <Stack.Screen
                        name="DrawerNavigator"
                        component={DrawerNavigator}
                        options={{
                            headerTitle: () => (
                                <Image
                                    source={logo}
                                    style={{width: 150, height: 40, resizeMode: 'contain'}}
                                />
                            ),
                            headerTitleAlign: 'center',
                        }}
                    />
                    <Stack.Screen
                        name="WorkoutViewScreen"
                        component={WorkoutViewScreen}
                        options={{
                            headerTitle: () => (
                                <Image
                                    source={logo}
                                    style={{width: 150, height: 40, resizeMode: 'contain'}}
                                />
                            ),
                            headerTitleAlign: 'center',
                        }}
                    />
                </>
            ) : (
                <>
                    <Stack.Screen
                        name="Login"
                        component={LoginScreen}
                        options={{
                            headerTitleAlign: 'center',
                            headerShown: false,
                        }}
                    />
                    <Stack.Screen
                        name="SignUp"
                        component={SignUpScreen}
                        options={{
                            headerTitleAlign: 'center',
                            headerShown: false,
                        }}
                    />
                    <Stack.Screen
                        name="InitialInfo"
                        component={InitialInfoScreen}
                        options={{
                            headerTitleAlign: 'center',
                            headerShown: false,
                            headerTitle: () => (
                                <Image
                                    source={logo}
                                    style={{width: 150, height: 50, resizeMode: 'contain'}}
                                />
                            ),
                        }}
                    />
                    <Stack.Screen
                        name="ForgotPassword"
                        component={ForgotPasswordScreen}
                        options={{
                            headerTitleAlign: 'center',
                            headerShown: false,
                            headerTitle: () => (
                                <Image
                                    source={logo}
                                    style={{width: 150, height: 50, resizeMode: 'contain'}}
                                />
                            ),
                        }}
                    />
                </>
            )}
        </Stack.Navigator>
    );
};

export default RootNavigator;
