export const designSystem = {
  themes: {
    light: {
      background: '#F8F9FB',
      surface: '#FFFFFF',
      surfaceOverlay: 'rgba(255, 255, 255, 0.6)',
      accentPrimary: '#9B8AFB',
      accentSecondary: '#C8BFFF',
      textPrimary: '#1A1A1A',
      textSecondary: '#636A7E',
      border: 'rgba(0, 0, 0, 0.08)',
      shadow: 'rgba(0, 0, 0, 0.05)',
    },
    dark: {
      background: '#0E1016',
      surface: '#1B1D27',
      surfaceOverlay: 'rgba(255, 255, 255, 0.05)',
      accentPrimary: '#A99FFF',
      accentSecondary: '#5C4EFF',
      textPrimary: '#F5F6FA',
      textSecondary: '#B1B4C6',
      border: 'rgba(255, 255, 255, 0.08)',
      shadow: 'rgba(0, 0, 0, 0.4)',
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '2rem',
    xl: '4rem',
  },
  borderRadius: {
    small: '0.5rem',
    medium: '1rem',
    large: '1.5rem',
    pill: '9999px',
  },
} as const;
