import React from 'react';
import { View, Text, SafeAreaView, ActivityIndicator } from 'react-native';
import { AppProvider, useApp } from './src/contexts/AppContext';
import { MatchingService } from './src/services/MatchingService';

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

  const testIncomingCall = '+84 987 654 321';
  // Note: since blockNumbers is likely empty right now, we can mock a rule for testing UI
  const testRule = { id: 'test', name: 'Spammer Test', numberPattern: '0987654000', isActive: true };
  const mockBlockedNumbers = blockedNumbers.length > 0 ? blockedNumbers : [testRule];
  
  const mockSettings = { ...settings, isAppEnabled: true };
  const matchResult = MatchingService.checkCall(testIncomingCall, mockBlockedNumbers, mockSettings);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 20 }}>Matching Engine Test</Text>
      
      <Text style={{ marginTop: 10, fontWeight: 'bold' }}>Settings:</Text>
      <Text>Rating Threshold: {settings.rating}%</Text>
      
      <Text style={{ marginTop: 10, fontWeight: 'bold' }}>Test Rule (Mock):</Text>
      <Text>Target: {mockBlockedNumbers[0].numberPattern}</Text>
      
      <Text style={{ marginTop: 10, fontWeight: 'bold' }}>Incoming Call:</Text>
      <Text>{testIncomingCall}</Text>
      
      <Text style={{ marginTop: 20, fontWeight: 'bold', color: matchResult.isBlocked ? 'red' : 'green', fontSize: 18 }}>
        Result: {matchResult.isBlocked ? 'BLOCKED' : 'ALLOWED'}
      </Text>
      <Text>Similarity: {matchResult.similarity}%</Text>
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
