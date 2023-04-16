import React from 'react';
import {DrawerItem} from '@react-navigation/drawer';
import {firebaseApp, auth, db} from '../config/firebaseConfig.js';
import {IconButton} from 'react-native-paper';

const SignOutButton = () => {
  const handleSignOut = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <DrawerItem
      label="Sign Out"
      icon={() => (
        <IconButton name="logout" size={24} color="black" icon={'logout'} />
      )}
      onPress={handleSignOut}
    />
  );
};

export default SignOutButton;
