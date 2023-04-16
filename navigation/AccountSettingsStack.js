import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import AccountSettingsScreen from '../screens/AccountSettingsScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import {IconButton} from 'react-native-paper';
import {DrawerActions} from '@react-navigation/native';

const Stack = createStackNavigator();

const AccountSettingsStack = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerMode: 'screen',
            }}>
            <Stack.Screen
                name="AccountSettings"
                component={AccountSettingsScreen}
                options={({navigation}) => ({
                    headerTitle: 'Account Settings',
                    headerLeft: () => (
                        <IconButton
                            icon="menu"
                            size={24}
                            onPress={() => {
                                navigation.dispatch(DrawerActions.toggleDrawer());
                            }}
                        />
                    ),
                })}
            />
            <Stack.Screen
                name="ChangePassword"
                component={ChangePasswordScreen}
                options={({navigation}) => ({
                    headerTitle: 'Change Password',
                })}
            />
        </Stack.Navigator>
    );
};

export default AccountSettingsStack;
