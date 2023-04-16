import React from 'react';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItem,
} from '@react-navigation/drawer';
import {View, Image, StyleSheet} from 'react-native';
import TabNavigator from './TabNavigator';
import AccountSettingsStack from './AccountSettingsStack';
import SignOutButton from '../components/SignOutButton';
import Icon from 'react-native-paper/src/components/Icon';
import {IconButton} from 'react-native-paper';
import ProfileStack from './ProfileStack';

const Drawer = createDrawerNavigator();

const CustomDrawerContent = props => {
  return (
    <DrawerContentScrollView {...props}>
      <DrawerItem
        label="DeSollarFitness"
        icon={() => (
          <IconButton name="home" size={24} color="black" icon={'home'} />
        )}
        onPress={() => props.navigation.navigate('DeSollarFitness')}
      />
      <DrawerItem
        label="Account Settings"
        icon={() => (
          <IconButton
            name="account-settings"
            size={24}
            color="black"
            icon={'account-settings'}
          />
        )}
        onPress={() => props.navigation.navigate('AccountSettingsStack')}
      />
      <View style={{flex: 1, justifyContent: 'flex-end', marginBottom: 16}}>
        <SignOutButton />
      </View>
    </DrawerContentScrollView>
  );
};

const DrawerNavigator = () => {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
      }}
      drawerContent={props => <CustomDrawerContent {...props} />}>
      <Drawer.Screen name="DeSollarFitness" component={TabNavigator} />
      <Drawer.Screen
        name="AccountSettingsStack"
        component={AccountSettingsStack}
      />
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    flex: 1,
    resizeMode: 'contain',
    justifyContent: 'center',
    width: 150,
    height: 150,
  },
  imageContainer: {
    width: '100%',
    height: 150,
    alignItems: 'center',
  },
});
export default DrawerNavigator;
