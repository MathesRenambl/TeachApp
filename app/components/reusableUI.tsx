import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS, getTextStyle, getBadgeStyle, getBadgeTextStyle } from './designSystem';

// Button Component
interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
    size?: 'small' | 'medium' | 'large';
    disabled?: boolean;
    icon?: string;
    style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
    title,
    onPress,
    variant = 'primary',
    size = 'medium',
    disabled = false,
    icon,
    style
}) => {
    const getButtonStyle = (): ViewStyle => {
        const baseStyle = {
            borderRadius: RADIUS.md,
            flexDirection: 'row' as const,
            alignItems: 'center' as const,
            justifyContent: 'center' as const,
            gap: SPACING.sm,
        };

        const sizeStyles = {
            small: { paddingVertical: SPACING.verticalSm, paddingHorizontal: SPACING.md },
            medium: { paddingVertical: SPACING.verticalMd, paddingHorizontal: SPACING.lg },
            large: { paddingVertical: SPACING.verticalLg, paddingHorizontal: SPACING.xl },
        };

        const variantStyles = {
            primary: {
                backgroundColor: COLORS.brand.main,
                ...SHADOWS.colored(COLORS.brand.main),
            },
            secondary: {
                backgroundColor: COLORS.primary.secondary,
                ...SHADOWS.colored(COLORS.primary.secondary),
            },
            outline: {
                backgroundColor: 'transparent',
                borderWidth: 2,
                borderColor: COLORS.brand.main,
            },
        };

        return {
            ...baseStyle,
            ...sizeStyles[size],
            ...variantStyles[variant],
            opacity: disabled ? 0.6 : 1,
        };
    };

    const getTextColor = () => {
        if (variant === 'outline') return COLORS.brand.main;
        return COLORS.neutral.80;
    };

    return (
        <TouchableOpacity
            style={[getButtonStyle(), style]}
            onPress={onPress}
            disabled={disabled}
            activeOpacity={0.8}
        >
            {icon && (
                <Icon name={icon as any} size={20} color={getTextColor()} />
            )}
            <Text style={[getTextStyle('bodyLarge', 'semiBold', getTextColor())]}>
                {title}
            </Text>
        </TouchableOpacity>
    );
};

// Card Component
interface CardProps {
    children: React.ReactNode;
    style?: ViewStyle;
    gradient?: string[];
    onPress?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, style, gradient, onPress }) => {
    if (gradient) {
        return (
            <TouchableOpacity
                style={[styles.cardContainer, style]}
                onPress={onPress}
                activeOpacity={onPress ? 0.8 : 1}
                disabled={!onPress}
            >
                <LinearGradient
                    colors={gradient}
                    style={styles.gradientCard}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    {children}
                </LinearGradient>
            </TouchableOpacity>
        );
    }

    const Component = onPress ? TouchableOpacity : View;
    
    return (
        <Component
            style={[styles.card, style]}
            onPress={onPress}
            activeOpacity={onPress ? 0.8 : 1}
        >
            {children}
        </Component>
    );
};

// Badge Component
interface BadgeProps {
    text: string;
    type?: 'success' | 'warning' | 'info' | 'neutral' | 'error';
    style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({ text, type = 'neutral', style }) => {
    return (
        <View style={[getBadgeStyle(type), style]}>
            <Text style={getBadgeTextStyle(type)}>{text}</Text>
        </View>
    );
};

// Avatar Component
interface AvatarProps {
    size?: number;
    icon?: string;
    gradient?: string[];
    backgroundColor?: string;
    iconColor?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
    size = 48,
    icon = 'person',
    gradient,
    backgroundColor = COLORS.brand.subtitle,
    iconColor = COLORS.brand.main
}) => {
    const avatarStyle = {
        width: size,
        height: size,
        borderRadius: size / 2,
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
        ...SHADOWS.small,
    };

    if (gradient) {
        return (
            <LinearGradient
                colors={gradient}
                style={avatarStyle}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <Icon name={icon as any} size={size * 0.5} color={COLORS.neutral.80} />
            </LinearGradient>
        );
    }

    return (
        <View style={[avatarStyle, { backgroundColor }]}>
            <Icon name={icon as any} size={size * 0.5} color={iconColor} />
        </View>
    );
};

// Section Header Component
interface SectionHeaderProps {
    title: string;
    subtitle?: string;
    onActionPress?: () => void;
    actionText?: string;
    style?: ViewStyle;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
    title,
    subtitle,
    onActionPress,
    actionText = 'See all',
    style
}) => {
    return (
        <View style={[styles.sectionHeader, style]}>
            <View style={styles.sectionTitleContainer}>
                <Text style={getTextStyle('titleLarge', 'bold')}>{title}</Text>
                {subtitle && (
                    <Text style={getTextStyle('bodyMedium', 'regular', COLORS.neutral.30)}>
                        {subtitle}
                    </Text>
                )}
            </View>
            {onActionPress && (
                <TouchableOpacity style={styles.sectionAction} onPress={onActionPress} activeOpacity={0.7}>
                    <Text style={getTextStyle('bodyMedium', 'semiBold', COLORS.brand.main)}>
                        {actionText}
                    </Text>
                    <Icon name="arrow-forward" size={16} color={COLORS.brand.main} />
                </TouchableOpacity>
            )}
        </View>
    );
};

// Loading Component
interface LoadingProps {
    size?: 'small' | 'medium' | 'large';
    color?: string;
}

export const Loading: React.FC<LoadingProps> = ({ 
    size = 'medium', 
    color = COLORS.brand.main 
}) => {
    const iconSize = {
        small: 16,
        medium: 24,
        large: 32,
    };

    return (
        <View style={styles.loadingContainer}>
            <Icon name="refresh" size={iconSize[size]} color={color} />
        </View>
    );
};

// Empty State Component
interface EmptyStateProps {
    icon: string;
    title: string;
    subtitle: string;
    actionText?: string;
    onActionPress?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    icon,
    title,
    subtitle,
    actionText,
    onActionPress
}) => {
    return (
        <View style={styles.emptyState}>
            <View style={styles.emptyStateIcon}>
                <Icon name={icon as any} size={48} color={COLORS.neutral.40} />
            </View>
            <Text style={getTextStyle('titleMedium', 'semiBold', COLORS.neutral.20)}>
                {title}
            </Text>
            <Text style={[getTextStyle('bodyMedium', 'regular', COLORS.neutral.30), styles.emptyStateSubtitle]}>
                {subtitle}
            </Text>
            {actionText && onActionPress && (
                <Button
                    title={actionText}
                    onPress={onActionPress}
                    variant="primary"
                    style={styles.emptyStateButton}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    // Card styles
    cardContainer: {
        borderRadius: RADIUS.lg,
        overflow: 'hidden',
    },
    card: {
        backgroundColor: COLORS.neutral.80,
        borderRadius: RADIUS.lg,
        padding: SPACING.lg,
        ...SHADOWS.medium,
        borderWidth: 1,
        borderColor: COLORS.neutral.60,
    },
    gradientCard: {
        padding: SPACING.lg,
    },

    // Section Header styles
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: SPACING.verticalMd,
    },
    sectionTitleContainer: {
        flex: 1,
    },
    sectionAction: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'transparent',
        paddingVertical: SPACING.verticalSm,
        paddingHorizontal: SPACING.sm,
        gap: SPACING.xs,
    },

    // Loading styles
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.xl,
    },

    // Empty State styles
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.xl,
    },
    emptyStateIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.neutral.60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.verticalLg,
    },
    emptyStateSubtitle: {
        textAlign: 'center',
        marginTop: SPACING.verticalSm,
        marginBottom: SPACING.verticalXl,
        paddingHorizontal: SPACING.lg,
    },
    emptyStateButton: {
        minWidth: 120,
    },
});

export default {
    Button,
    Card,
    Badge,
    Avatar,
    SectionHeader,
    Loading,
    EmptyState,
};