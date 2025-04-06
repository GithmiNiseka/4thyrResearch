import { Theme } from '@react-navigation/native';

// Define your custom theme colors
interface AppColors {
  primary: string;
  secondary: string;
  background: string;
  doctorMessage: string;
  patientMessage: string;
  text: string;
  textSecondary: string;
  white: string;
  border: string;
  [key: string]: string;
}

interface AppSpacing {
  small: number;
  medium: number;
  large: number;
  [key: string]: number;
}

interface AppBorderRadius {
  small: number;
  medium: number;
  large: number;
  extraLarge: number;
  [key: string]: number;
}

export interface AppTheme extends Theme {
  colors: Theme['colors'] & AppColors;
  spacing: AppSpacing;
  borderRadius: AppBorderRadius;
}

// Implementation of the theme
const theme: AppTheme = {
    dark: false,
    colors: {
        // React Navigation default colors
        primary: '#128C7E',
        background: '#f5f5f5',
        card: '#ffffff',
        text: '#000000',
        border: '#dddddd',
        notification: '#ff3b30',

        // Our custom colors
        secondary: '#34B7F1',
        doctorMessage: '#dcf8c6',
        patientMessage: '#ffffff',
        textSecondary: '#666666',
        white: '#ffffff',
        
        error: '#ff3b30',
    },
    spacing: {
        small: 8,
        medium: 16,
        large: 24,
    },
    borderRadius: {
        small: 4,
        medium: 8,
        large: 12,
        extraLarge: 20,
    },
    fonts: {
        regular: {
            fontFamily: '',
            fontWeight: 'bold'
        },
        medium: {
            fontFamily: '',
            fontWeight: 'bold'
        },
        bold: {
            fontFamily: '',
            fontWeight: 'bold'
        },
        heavy: {
            fontFamily: '',
            fontWeight: 'bold'
        }
    }
};

export default theme; // Changed to default export