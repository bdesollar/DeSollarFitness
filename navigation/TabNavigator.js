// navigation/TabNavigator.js
import React from 'react';
import {Image} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Ionicons} from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import WorkoutsScreen from '../screens/WorkoutsScreen';
import logo from '../assets/Logo.png';
import {IconButton} from 'react-native-paper';
import {DrawerActions} from '@react-navigation/native';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({route, navigation}) => ({
                headerLeft: () => (
                    <IconButton
                        icon="menu"
                        size={24}
                        onPress={() => {
                            navigation.dispatch(DrawerActions.toggleDrawer());
                        }}
                    />
                ),
                headerTitleShown: false,
                tabBarIcon: ({focused, color, size}) => {
                    let iconName;

                    if (route.name === 'Home') {
                        iconName = focused ? 'ios-home' : 'ios-home-outline';
                    } else if (route.name === 'Profile') {
                        iconName = focused ? 'ios-person' : 'ios-person-outline';
                    } else if (route.name === 'Message') {
                        iconName = focused ? 'ios-chatbubbles' : 'ios-chatbubbles-outline';
                    } else if (route.name === 'NotesStack') {
                        iconName = focused ? 'ios-book' : 'ios-book-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color}/>;
                },
            })}>
            <Tab.Screen name="Home" component={HomeScreen}/>
            <Tab.Screen name="Workouts" component={WorkoutsScreen}/>
            <Tab.Screen name="Profile" component={ProfileScreen}/>
        </Tab.Navigator>
    );
};

export default TabNavigator;
