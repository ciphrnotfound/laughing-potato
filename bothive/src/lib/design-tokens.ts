/**
 * BotHive Design System
 * Unified design tokens extracted from signup form aesthetic
 * Provides consistent glass morphism, gradients, and spacing
 */

export const designTokens = {
    // Color palette
    colors: {
        dark: {
            // Backgrounds
            bg: '#070910',
            bgSoft: '#0b1024',
            cardBg: 'rgba(12, 19, 35, 0.8)',
            cardBgHover: 'rgba(12, 19, 35, 0.9)',

            // Borders
            border: 'rgba(255, 255, 255, 0.12)',
            borderHover: 'rgba(255, 255, 255, 0.25)',
            borderFocus: 'rgba(255, 255, 255, 0.30)',

            // Text
            text: '#ffffff',
            textMuted: 'rgba(255, 255, 255, 0.55)',
            textSubtle: 'rgba(255, 255, 255, 0.40)',

            // Accent colors (purple gradient)
            accentPrimary: '#6C43FF',
            accentSecondary: '#8A63FF',
            accentHover: '#7C54FF',

            // Gradients
            gradientPrimary: 'linear-gradient(135deg, #6C43FF, #8A63FF)',
            gradientSecondary: 'linear-gradient(135deg, #5163FF, #7F92FF)',
            gradientRadial: 'radial-gradient(circle at top, rgba(124, 68, 255, 0.22), transparent 70%)',
        },
        light: {
            // Backgrounds
            bg: 'linear-gradient(to bottom right, #F5F7FF, white, #E9EEFF)',
            bgSoft: '#F5F7FF',
            cardBg: 'rgba(255, 255, 255, 0.85)',
            cardBgHover: 'rgba(255, 255, 255, 0.95)',

            // Borders
            border: 'rgba(184, 196, 255, 0.40)',
            borderHover: 'rgba(163, 180, 242, 0.60)',
            borderFocus: 'rgba(163, 180, 242, 0.80)',

            // Text
            text: '#0C1024',
            textMuted: 'rgba(12, 16, 36, 0.55)',
            textSubtle: 'rgba(12, 16, 36, 0.40)',

            // Accent colors
            accentPrimary: '#5163FF',
            accentSecondary: '#7F92FF',
            accentHover: '#6B7DFF',

            // Gradients
            gradientPrimary: 'linear-gradient(135deg, #5F6BFF, #8A9AFF)',
            gradientSecondary: 'linear-gradient(135deg, #5163FF, #7F92FF)',
            gradientRadial: 'radial-gradient(circle at top, rgba(104, 120, 255, 0.18), transparent 72%)',
        },
    },

    // Glass morphism effects
    glass: {
        backdrop: 'blur(40px)',
        backdropStrong: 'blur(60px)',

        // Card shell styles
        cardShell: (isDark: boolean) => ({
            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(184, 196, 255, 0.40)'}`,
            backgroundColor: isDark ? 'rgba(12, 19, 35, 0.8)' : 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(40px)',
            boxShadow: isDark
                ? '0 48px 120px rgba(12, 15, 35, 0.55)'
                : '0 44px 110px rgba(88, 112, 255, 0.18)',
        }),

        // Input styles
        input: (isDark: boolean) => ({
            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : '#D7DEF8'}`,
            backgroundColor: isDark ? 'rgba(0, 0, 0, 0.40)' : 'rgba(255, 255, 255, 0.90)',
            color: isDark ? '#ffffff' : '#0C1024',
        }),
    },

    // Grid overlay patterns
    grid: {
        small: {
            size: '40px 40px',
            opacity: (isDark: boolean) => isDark ? 0.05 : 0.08,
        },
        medium: {
            size: '64px 64px',
            opacity: (isDark: boolean) => isDark ? 0.06 : 0.08,
        },
    },

    // Shadows
    shadows: {
        sm: '0 2px 8px rgba(0, 0, 0, 0.1)',
        md: '0 4px 16px rgba(0, 0, 0, 0.12)',
        lg: '0 8px 32px rgba(0, 0, 0, 0.15)',
        xl: '0 16px 48px rgba(0, 0, 0, 0.18)',
        glow: (color: string, opacity: number = 0.35) => `0 16px 40px rgba(${color}, ${opacity})`,
        glowPurple: '0 16px 40px rgba(108, 67, 255, 0.35)',
        glowBlue: '0 18px 46px rgba(118, 132, 255, 0.28)',
    },

    // Border radius
    radius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        '2xl': '24px',
        '3xl': '28px',
        full: '9999px',
    },

    // Spacing
    spacing: {
        xs: '0.25rem',  // 4px
        sm: '0.5rem',   // 8px
        md: '1rem',     // 16px
        lg: '1.5rem',   // 24px
        xl: '2rem',     // 32px
        '2xl': '3rem',  // 48px
        '3xl': '4rem',  // 64px
    },

    // Typography
    typography: {
        // Font families
        fontSans: 'var(--font-dmsans), ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "DM Sans", Inter, sans-serif',

        // Font sizes
        fontSize: {
            xs: '0.75rem',    // 12px
            sm: '0.875rem',   // 14px
            base: '1rem',     // 16px
            lg: '1.125rem',   // 18px
            xl: '1.25rem',    // 20px
            '2xl': '1.5rem',  // 24px
            '3xl': '1.875rem',// 30px
            '4xl': '2.25rem', // 36px
            '5xl': '3rem',    // 48px
        },

        // Letter spacing for uppercase labels
        tracking: {
            tight: '-0.01em',
            normal: '0',
            wide: '0.025em',
            wider: '0.05em',
            widest: '0.28em',  // Used in signup form
        },
    },

    // Animations
    animations: {
        duration: {
            fast: '150ms',
            normal: '200ms',
            slow: '300ms',
            slower: '450ms',
        },
        easing: {
            ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
            easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
            easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
            easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
        },
    },

    // Z-index layers
    zIndex: {
        base: 1,
        dropdown: 1000,
        sticky: 1100,
        fixed: 1200,
        overlay: 1300,
        modal: 1400,
        popover: 1500,
        toast: 1600,
    },
};

/**
 * Helper function to create grid overlay background
 */
export const createGridOverlay = (isDark: boolean, size: 'small' | 'medium' = 'medium') => {
    const gridSize = designTokens.grid[size].size;
    const opacity = designTokens.grid[size].opacity(isDark);
    const color = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(12, 16, 36, 0.08)';

    return {
        backgroundImage: `
      linear-gradient(to right, ${color} 1px, transparent 1px),
      linear-gradient(to bottom, ${color} 1px, transparent 1px)
    `,
        backgroundSize: gridSize,
        opacity: opacity,
    };
};

/**
 * Helper function to create radial gradient overlay
 */
export const createRadialOverlay = (isDark: boolean, position: string = 'top') => {
    return isDark
        ? `radial-gradient(circle at ${position}, rgba(108, 67, 255, 0.28), transparent 70%)`
        : `radial-gradient(circle at ${position}, rgba(99, 109, 255, 0.22), transparent 70%)`;
};

export default designTokens;
