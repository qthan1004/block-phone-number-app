import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {Platform} from 'react-native';

// Screens
import NumberListScreen from '../screens/NumberListScreen';
import CallLogScreen from '../screens/CallLogScreen';
import SettingsScreen from '../screens/SettingsScreen';
import NumberFormScreen from '../screens/NumberFormScreen';

export type RootTabParamList = {
  Settings: undefined; // Dashboard
  NumberList: undefined; // Blocklist
  CallLog: undefined; // Call Log
};

export type RootStackParamList = {
  MainTabs: undefined;
  NumberForm: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="Settings"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#F4F6F9',
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 74,
          paddingBottom: Platform.OS === 'ios' ? 24 : 10,
          paddingTop: 8,
          elevation: 24,
          shadowColor: '#000',
          shadowOffset: {width: 0, height: -4},
          shadowOpacity: 0.04,
          shadowRadius: 24,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          position: 'absolute',
        },
        tabBarActiveTintColor: '#5c11d4', // Primary Color
        tabBarInactiveTintColor: '#8D93A5', // Muted Slate
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
      }}>
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Dashboard',
          tabBarIcon: ({color, size}) => (
            <MaterialCommunityIcons
              name="shield-outline"
              color={color}
              size={28}
            />
          ),
        }}
      />
      <Tab.Screen
        name="NumberList"
        component={NumberListScreen}
        options={{
          title: 'Blocklist',
          tabBarIcon: ({color, size}) => (
            <MaterialCommunityIcons
              name="format-list-bulleted"
              color={color}
              size={28}
            />
          ),
        }}
      />
      <Tab.Screen
        name="CallLog"
        component={CallLogScreen}
        options={{
          title: 'Call Log',
          tabBarIcon: ({color, size}) => (
            <MaterialCommunityIcons name="history" color={color} size={28} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: {backgroundColor: '#F4F6F9'},
      }}>
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen
        name="NumberForm"
        component={NumberFormScreen}
        options={{
          headerShown: false,
          presentation: 'transparentModal',
          animation: 'slide_from_bottom',
        }}
      />
    </Stack.Navigator>
  );
};
