import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#17191C',
    background: '#F6F7F8',
    surface: '#FFFFFF',
    surfaceMuted: '#EFF1F3',
    border: '#DFE3E7',
    textSecondary: '#68707B',
    accent: '#167D69',
    accentContrast: '#FFFFFF',
    live: '#D64045',
    video: '#121618',
    videoMuted: '#AAB2B8',
  },
  dark: {
    text: '#F5F7F8',
    background: '#101214',
    surface: '#181B1E',
    surfaceMuted: '#23272B',
    border: '#30353A',
    textSecondary: '#A8B0B7',
    accent: '#43B59E',
    accentContrast: '#0B201B',
    live: '#FF6369',
    video: '#090B0C',
    videoMuted: '#9BA4AA',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const MaxContentWidth = 720;
