import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Color System
export const COLORS = {
    // Brand Colors
    brand: {
        main: '#2563EB',
        darker: '#2659BF',
        lighter: '#99BBFF',
        subtitle: '#E3EDFF',
    },
    // Primary Colors
    primary: {
        secondary: '#FE9519',
        darker: '#FEA419',
        lighter: '#FEC875',
        subtitle: '#FFF6E8',
    },
    // State Colors
    state: {
        error: '#E2222E',
        warning: '#FFCC00',
        info: '#0063F7',
        success: '#06C270',
    },
    // Neutral Colors
    neutral: {
        0: '#3A3A3C',   // Darkest text
        10: '#6B7588',  // Secondary text
        20: '#515960',  // Body text
        30: '#7D8388',  // Muted text
        40: '#A8ACAF',  // Disabled text
        50: '#3A3A3C',  // Dark neutral
        60: '#EAEBEC',  // Light border
        70: '#F4F4F5',  // Background
        80: '#FFFFFF',  // Card background
    }
};

// Typography System
export const TYPOGRAPHY = {
    fontFamily: 'Nunito',
    weights: {
        extraLight: '200' as const,
        regular: '400' as const,
        semiBold: '600' as const,
        bold: '700' as const,
        extraBold: '800' as const,
    },
    sizes: {
        // Headings (extraBold weight)
        headingLarge: 28,      // 28px - 1.3x line height
        headingMedium: 24,     // 24px - 1.3x line height  
        headingSmall: 22,      // 22px - 1.3x line height
        
        // Titles (Bold weight)
        titleLarge: 20,        // 20px - 1.3x line height
        titleMedium: 18,       // 18px - 1.3x line height (semiBold)
        titleSmall: 16,        // 16px - 1.3x line height (Bold)
        
        // Body Text (Light/Regular/semiBold weight)
        bodyLarge: 14,         // 14px - 1.7x line height
        bodyMedium: 13,        // 13px - 1.7x line height (Bold)
        bodySmall: 12,         // 12px - 1.7x line height
    },
    lineHeights: {
        heading: 1.3,   // For headings and titles
        body: 1.7,      // For body text
    }
};

// Spacing System
export const SPACING = {
    // Base spacing units
    xs: width * 0.01,      // 4px
    sm: width * 0.02,      // 8px
    md: width * 0.03,      // 12px
    lg: width * 0.04,      // 16px
    xl: width * 0.06,      // 24px
    xxl: width * 0.08,     // 32px
    
    // Vertical spacing
    verticalXs: height * 0.005,    // 4px
    verticalSm: height * 0.01,     // 8px
    verticalMd: height * 0.015,    // 12px
    verticalLg: height * 0.02,     // 16px
    verticalXl: height * 0.025,    // 20px
    verticalXxl: height * 0.03,    // 24px
};

// Border Radius System
export const RADIUS = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    circle: 999,
};

// Shadow System
export const SHADOWS = {
    small: {
        elevation: 2,
        shadowColor: COLORS.neutral.0,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    medium: {
        elevation: 4,
        shadowColor: COLORS.neutral.0,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    large: {
        elevation: 8,
        shadowColor: COLORS.neutral.0,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
    },
    colored: (color: string) => ({
        elevation: 6,
        shadowColor: color,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
    }),
};

// Common Component Styles
export const COMMON_STYLES = {
    // Card styles
    card: {
        backgroundColor: COLORS.neutral.80,
        borderRadius: RADIUS.lg,
        padding: SPACING.lg,
        ...SHADOWS.medium,
        borderWidth: 1,
        borderColor: COLORS.neutral.60,
    },
    
    // Button styles
    primaryButton: {
        backgroundColor: COLORS.brand.main,
        borderRadius: RADIUS.md,
        paddingVertical: SPACING.verticalMd,
        paddingHorizontal: SPACING.xl,
        ...SHADOWS.colored(COLORS.brand.main),
    },
    
    secondaryButton: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: COLORS.brand.main,
        borderRadius: RADIUS.md,
        paddingVertical: SPACING.verticalMd,
        paddingHorizontal: SPACING.xl,
    },
    
    // Text styles
    primaryButtonText: {
        fontSize: TYPOGRAPHY.sizes.bodyLarge,
        fontWeight: TYPOGRAPHY.weights.semiBold,
        color: COLORS.neutral.80,
        fontFamily: TYPOGRAPHY.fontFamily,
        textAlign: 'center' as const,
    },
    
    secondaryButtonText: {
        fontSize: TYPOGRAPHY.sizes.bodyLarge,
        fontWeight: TYPOGRAPHY.weights.semiBold,
        color: COLORS.brand.main,
        fontFamily: TYPOGRAPHY.fontFamily,
        textAlign: 'center' as const,
    },
    
    // Badge styles
    successBadge: {
        backgroundColor: COLORS.state.success + '20',
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.verticalXs,
        borderRadius: RADIUS.sm,
        ...SHADOWS.colored(COLORS.state.success),
    },
    
    warningBadge: {
        backgroundColor: COLORS.primary.secondary + '20',
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.verticalXs,
        borderRadius: RADIUS.sm,
        ...SHADOWS.colored(COLORS.primary.secondary),
    },
    
    infoBadge: {
        backgroundColor: COLORS.state.info + '20',
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.verticalXs,
        borderRadius: RADIUS.sm,
        ...SHADOWS.colored(COLORS.state.info),
    },
    
    neutralBadge: {
        backgroundColor: COLORS.neutral.60,
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.verticalXs,
        borderRadius: RADIUS.sm,
        ...SHADOWS.small,
    },
};

// Layout Constants
export const LAYOUT = {
    screenPadding: SPACING.lg,
    sectionSpacing: SPACING.verticalXxl,
    cardSpacing: SPACING.verticalMd,
    elementSpacing: SPACING.verticalSm,
    
    // Common dimensions
    headerHeight: height * 0.08,
    tabHeight: height * 0.06,
    avatarSize: 48,
    iconSize: {
        small: 16,
        medium: 20,
        large: 24,
        xlarge: 32,
    },
};

// Animation Constants
export const ANIMATIONS = {
    timing: {
        fast: 200,
        normal: 300,
        slow: 500,
    },
    easing: {
        easeInOut: 'ease-in-out',
        easeOut: 'ease-out',
        easeIn: 'ease-in',
    },
};

// Helper Functions
export const getTextStyle = (size: keyof typeof TYPOGRAPHY.sizes, weight: keyof typeof TYPOGRAPHY.weights, color?: string) => ({
    fontSize: TYPOGRAPHY.sizes[size],
    fontWeight: TYPOGRAPHY.weights[weight],
    fontFamily: TYPOGRAPHY.fontFamily,
    color: color || COLORS.neutral.0,
    lineHeight: TYPOGRAPHY.sizes[size] * (size.includes('body') ? TYPOGRAPHY.lineHeights.body : TYPOGRAPHY.lineHeights.heading),
});

export const getSpacing = (multiplier: number = 1) => ({
    padding: SPACING.lg * multiplier,
    margin: SPACING.lg * multiplier,
});

export const getBadgeStyle = (type: 'success' | 'warning' | 'info' | 'neutral' | 'error') => {
    const baseStyle = {
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.verticalXs,
        borderRadius: RADIUS.sm,
        borderWidth: 1,
        borderColor: 'transparent',
    };

    switch (type) {
        case 'success':
            return {
                ...baseStyle,
                backgroundColor: COLORS.state.success + '20',
                ...SHADOWS.colored(COLORS.state.success),
            };
        case 'warning':
            return {
                ...baseStyle,
                backgroundColor: COLORS.primary.secondary + '20',
                ...SHADOWS.colored(COLORS.primary.secondary),
            };
        case 'info':
            return {
                ...baseStyle,
                backgroundColor: COLORS.state.info + '20',
                ...SHADOWS.colored(COLORS.state.info),
            };
        case 'error':
            return {
                ...baseStyle,
                backgroundColor: COLORS.state.error + '20',
                ...SHADOWS.colored(COLORS.state.error),
            };
        default:
            return {
                ...baseStyle,
                backgroundColor: COLORS.neutral.60,
                ...SHADOWS.small,
            };
    }
};

export const getBadgeTextStyle = (type: 'success' | 'warning' | 'info' | 'neutral' | 'error') => {
    const baseStyle = {
        fontSize: TYPOGRAPHY.sizes.bodySmall,
        fontWeight: TYPOGRAPHY.weights.semiBold,
        fontFamily: TYPOGRAPHY.fontFamily,
    };

    switch (type) {
        case 'success':
            return { ...baseStyle, color: COLORS.state.success };
        case 'warning':
            return { ...baseStyle, color: COLORS.primary.secondary };
        case 'info':
            return { ...baseStyle, color: COLORS.state.info };
        case 'error':
            return { ...baseStyle, color: COLORS.state.error };
        default:
            return { ...baseStyle, color: COLORS.neutral.20 };
    }
};