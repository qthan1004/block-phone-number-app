import {
  MD3LightTheme as PaperLightTheme,
  adaptNavigationTheme,
} from 'react-native-paper';
import {DefaultTheme as NavigationDefaultTheme} from '@react-navigation/native';

const {LightTheme} = adaptNavigationTheme({
  reactNavigationLight: NavigationDefaultTheme,
});

const PrimaryColor = '#5c11d4'; // Purple from StitchMCP
const AccentMint = '#2ED299';
const AccentWatermelon = '#FF5A5F';

export const AppTheme = {
  ...PaperLightTheme,
  ...LightTheme,
  roundness: 24, // From StitchMCP 'rounded-card'
  colors: {
    ...PaperLightTheme.colors,
    ...LightTheme.colors,
    primary: PrimaryColor,
    primaryContainer: 'rgba(92, 17, 212, 0.1)',
    secondaryContainer: 'rgba(92, 17, 212, 0.05)',
    background: '#F4F6F9', // Light mode background
    surface: '#FFFFFF', // Card surface
    surfaceVariant: '#F4F6F9',
    onPrimary: '#FFFFFF',
    onSurface: '#1A1B25',
    text: '#1A1B25',
    error: AccentWatermelon,
    success: AccentMint,
    border: '#E2E6EE',
    backdrop: 'rgba(0,0,0,0.5)',
    elevation: {
      level0: 'transparent',
      level1: '#FFFFFF',
      level2: '#FFFFFF',
      level3: '#FFFFFF',
      level4: '#FFFFFF',
      level5: '#FFFFFF',
    },
  },
  fonts: {
    ...PaperLightTheme.fonts,
  },
};
