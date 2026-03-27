import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';

import { AppProvider } from './src/contexts/AppContext';
import { AppTheme } from './src/theme';
import { AppNavigator } from './src/navigation/AppNavigator';

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <PaperProvider theme={AppTheme}>
          <NavigationContainer theme={AppTheme}>
            <AppNavigator />
          </NavigationContainer>
        </PaperProvider>
      </AppProvider>
    </SafeAreaProvider>
  );
}

export default App;
