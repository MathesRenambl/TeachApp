import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export type TabType = 'upload' | 'library' | 'assessment';

interface TabItem {
    key: TabType;
    icon: string;
    label: string;
}

interface TabNavigationProps {
    activeTab: TabType;
    onTabPress: (tab: TabType) => void;
    tabs?: TabItem[];
}

const defaultTabs: TabItem[] = [
    { key: 'upload', icon: 'dashboard', label: 'Dashboard' },
    { key: 'library', icon: 'library-books', label: 'Library' },
    { key: 'assessment', icon: 'assignment', label: 'Assessment' },
];

const TabNavigation: React.FC<TabNavigationProps> = ({
    activeTab,
    onTabPress,
    tabs = defaultTabs
}) => {
    return (
        <View style={styles.tabNavigation}>
            {tabs.map((tab) => (
                <TouchableOpacity
                    key={tab.key}
                    style={[styles.tab, activeTab === tab.key && styles.activeTab]}
                    onPress={() => onTabPress(tab.key)}
                >
                    <Icon
                        name={tab.icon as any}
                        size={20}
                        color={activeTab === tab.key ? '#667eea' : '#95A5A6'}
                    />
                    <Text
                        style={[
                            styles.tabText,
                            activeTab === tab.key && styles.activeTabText
                        ]}
                    >
                        {tab.label}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    tabNavigation: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: width * 0.05,
        borderBottomWidth: 1,
        borderBottomColor: '#E9ECEF',
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: height * 0.02,
        borderBottomWidth: 3,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: '#667eea',
    },
    tabText: {
        fontSize: width * 0.035,
        color: '#95A5A6',
        marginLeft: width * 0.02,
        fontWeight: '500',
    },
    activeTabText: {
        color: '#667eea',
        fontWeight: '600',
    },
});

export default TabNavigation;