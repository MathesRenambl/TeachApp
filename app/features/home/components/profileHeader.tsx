import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface ProfileHeaderProps {
    teacherName?: string;
    notificationCount?: number;
    onNotificationPress?: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
    teacherName = "Gokul Thirumal",
    notificationCount = 3,
    onNotificationPress
}) => {
    return (
        <View style={styles.header}>
            <View style={styles.headerContent}>
                <View style={styles.headerLeft}>
                    <LinearGradient
                        colors={['#667eea', '#764ba2']}
                        style={styles.profileIcon}
                    >
                        <Icon name="person" size={24} color="#FFFFFF" />
                    </LinearGradient>
                    <View>
                        <Text style={styles.welcomeText}>Welcome back,</Text>
                        <Text style={styles.teacherName}>{teacherName}</Text>
                    </View>
                </View>
                <TouchableOpacity 
                    style={styles.notificationIcon}
                    onPress={onNotificationPress}
                >
                    <Icon name="notifications" size={24} color="#7F8C8D" />
                    {notificationCount > 0 && (
                        <View style={styles.notificationBadge}>
                            <Text style={styles.notificationBadgeText}>
                                {notificationCount > 9 ? '9+' : notificationCount.toString()}
                            </Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: width * 0.05,
        paddingVertical: height * 0.02,
        borderBottomWidth: 1,
        borderBottomColor: '#E9ECEF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 5,
        marginTop:-8
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    profileIcon: {
        width: width * 0.12,
        height: width * 0.12,
        borderRadius: width * 0.06,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: width * 0.03,
    },
    welcomeText: {
        fontSize: width * 0.035,
        color: '#7F8C8D',
    },
    teacherName: {
        fontSize: width * 0.045,
        fontWeight: '700',
        color: '#2C3E50',
    },
    notificationIcon: {
        position: 'relative',
        padding: 8,
    },
    notificationBadge: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: '#E74C3C',
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    notificationBadgeText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
    },
});

export default ProfileHeader;