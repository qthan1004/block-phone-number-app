import React from 'react';
import { View, Text, SafeAreaView, ActivityIndicator } from 'react-native';
import { AppProvider, useApp } from './src/contexts/AppContext';

const MainScreen = () => {
  const { isLoading, settings, blockedNumbers } = useApp();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text>Loading Data Layer...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Data Layer Loaded OK!</Text>
      <Text style={{ marginTop: 10 }}>Rating Threshold: {settings.rating}%</Text>
      <Text>Blocked Numbers Count: {blockedNumbers.length}</Text>
    </View>
  );
};

function App(): React.JSX.Element {
  return (
    <AppProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <MainScreen />
      </SafeAreaView>
    </AppProvider>
  );
}

export default App;
