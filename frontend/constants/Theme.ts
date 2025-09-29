export interface ThemeColors {
  // Background colors
  background: string;
  surface: string;
  surfaceVariant: string;
  
  // Text colors
  text: string;
  textSecondary: string;
  textTertiary: string;
  
  // Primary colors
  primary: string;
  primaryVariant: string;
  
  // Accent colors
  accent: string;
  accentVariant: string;
  
  // Border and divider colors
  border: string;
  divider: string;
  
  // Status colors
  success: string;
  warning: string;
  error: string;
  
  // Card and component colors
  card: string;
  cardHover: string;
  
  // Navigation colors
  tabActive: string;
  tabInactive: string;
  
  // Icon colors
  icon: string;
  iconSecondary: string;
}

export const lightTheme: ThemeColors = {
  // Background colors - Keep light base with burgundy accents
  background: '#FFF2E8',
  surface: '#FFFFFF',
  surfaceVariant: '#F3F4F6',
  
  // Text colors - Rich burgundy for contrast
  text: '#2d1b1e',
  textSecondary: '#7f1d1d',
  textTertiary: '#9CA3AF',
  
  // Primary colors - Deep burgundy gradients
  primary: '#7f1d1d',
  primaryVariant: '#5c1515',
  
  // Accent colors - Light pink almond tones
  accent: '#7f1d1d',
  accentVariant: '#FEF2F2',
  
  // Border and divider colors - Burgundy accents
  border: '#7f1d1d',
  divider: '#E5E7EB',
  
  // Status colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  
  // Card and component colors - Rich burgundy cards on light base
  card: '#2d1b1e',
  cardHover: '#4d3b3e',
  
  // Navigation colors - Burgundy theme
  tabActive: '#7f1d1d',
  tabInactive: '#6B7280',
  
  // Icon colors - Burgundy for contrast
  icon: '#7f1d1d',
  iconSecondary: '#FEF2F2',
};

export const darkTheme: ThemeColors = {
  // Background colors - LinkedIn/Telegram inspired deep blues and blacks
  background: '#0A0E27',
  surface: '#1A1F36',
  surfaceVariant: '#252B42',
  
  // Text colors - High contrast for readability
  text: '#FFFFFF',
  textSecondary: '#B8BCC8',
  textTertiary: '#8B8FA3',
  
  // Primary colors - Elegant burgundy with better contrast
  primary: '#E63946',
  primaryVariant: '#D62828',
  
  // Accent colors - Professional blue accent
  accent: '#457B9D',
  accentVariant: '#1D3557',
  
  // Border and divider colors - Subtle but visible
  border: '#3A4058',
  divider: '#2A2F45',
  
  // Status colors - Adjusted for dark theme
  success: '#06D6A0',
  warning: '#FFD60A',
  error: '#E63946',
  
  // Card and component colors - Layered depth
  card: '#1A1F36',
  cardHover: '#252B42',
  
  // Navigation colors
  tabActive: '#E63946',
  tabInactive: '#B8BCC8',
  
  // Icon colors - Proper contrast
  icon: '#FFFFFF',
  iconSecondary: '#B8BCC8',
};

export type Theme = 'light' | 'dark';
