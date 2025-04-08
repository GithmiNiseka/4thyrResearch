import { DefaultTheme } from '@react-navigation/native';

interface AppColors {
  surfaceContainer: string;
  outline: string;
  warning: string;
  success: string;
  error: string;
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  doctorMessage: string;
  patientMessage: string;
  text: string;
  textSecondary: string;
  white: string;
  black: string;
  border: string;
  shadow: string;
  surfaceContainerLowest: string;
  [key: string]: string; // Index signature for additional colors
  hoverImageBorder: string;
}

interface AppSpacing {
  small: number;
  medium: number;
  large: number;
  [key: string]: number; // Index signature for additional spacing
}

interface AppBorderRadius {
  small: number;
  medium: number;
  large: number;
  extraLarge: number;
  [key: string]: number; // Index signature for additional radii
}

export interface AppTheme {
  colors: AppColors;
  spacing: AppSpacing;
  borderRadius: AppBorderRadius;
}

export const theme: AppTheme = {
  colors: {
    primary: '#128C7E',
    secondary: '#34B7F1',
    background: '#f5f5f5',
    surface: '#ffffff',
    doctorMessage: '#dcf8c6',
    patientMessage: '#ffffff',
    text: '#000000',
    textSecondary: '#666666',
    white: '#ffffff',
    black: '#000000',
    border: '#dddddd',
    shadow: '#cccccc',
    surfaceContainerLowest: '#f5f5f5',
    surfaceContainer: '#eeeeee',
    outline: '#aaaaaa',
    warning: '#FFA000',
    success: '#4CAF50',
    error: '#F44336',
    hoverImageBorder: '#cccccc',
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
};

// For React Navigation theming
export const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: theme.colors.primary,
    background: theme.colors.background,
    card: theme.colors.surface,
    text: theme.colors.text,
    border: theme.colors.border,
    notification: theme.colors.error,
  },
};