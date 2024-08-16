import React from 'react';
import { StyleSheet, View, Text, ScrollView, useColorScheme, Dimensions, Image } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';

const Description = () => {
    const colorScheme = useColorScheme();
    const isDarkMode = colorScheme === 'dark';

    const screenWidth = Dimensions.get('window').width;
    const descWidth = screenWidth * 0.6;

    return (
        <ScrollView style={isDarkMode ? styles.containerDark : styles.containerLight}>
            <ThemedView style={[styles.descriptionContainer, { width: descWidth }]}>

                <ThemedText style={styles.body}>
                    Welcome to Cloud-Clip, the ultimate cross-device clipboard management tool that simplifies your digital life.
                    Whether you are switching between your laptop, tablet, and smartphone, or collaborating with friends and colleagues,
                    Cloud-Clip ensures that your copied content is always at your fingertips. Seamlessly sync text and data across all your
                    devices in real time, and effortlessly share your clipboard with others using encrypted connections and secure sharing options.
                </ThemedText>

                <ThemedText type="subtitle" style={styles.subtitle}>Features</ThemedText>

                <ThemedText style={styles.body}>
                    <Text style={styles.featureTitle}>Real-Time Cross-Device Sync: </Text> Instantly access copied text and data on all your devices.
                    Whether you’re working on your computer, using your tablet, or on your smartphone, Cloud-Clip keeps your clipboard synchronized
                    in real time, ensuring you always have the information you need right at your fingertips.
                </ThemedText>
                <View style={styles.imgContainer}>
                    <Image source={require('@/assets/images/real-time-sync.png')} style={styles.image} />
                </View>
                <ThemedText style={styles.body}>
                    {'\n'}
                </ThemedText>

                <ThemedText style={styles.body}>
                    <Text style={styles.featureTitle}>Secure and Convenient Sharing: </Text>
                    Share clipboard content effortlessly with friends and colleagues using Cloud-Clip. With end-to-end encryption, your data stays secure. Generate unique codes or shared links to quickly share specific clips. Recipients can access the content securely, even without Cloud-Clip installed.
                </ThemedText>
                <View style={styles.imgContainer}>
                    <Image source={require('@/assets/images/secure-data-sharing.png')} style={styles.image} />
                </View>
                <ThemedText style={styles.body}>
                    {'\n'}
                </ThemedText>
            </ThemedView>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    containerLight: {
        // flex: 1,
        backgroundColor: '#fff',
        padding: 16,
    },
    containerDark: {
        // flex: 1,
        backgroundColor: '#fff',
        padding: 16,
    },
    descriptionContainer: {
        alignSelf: 'center',
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#000', // Black text in light mode
    },
    subtitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 16,
        marginBottom: 8,
        color: '#000', // Black text in light mode
    },
    body: {
        textAlign: 'justify',
        fontSize: 16,
        lineHeight: 24,
        color: '#000', // Black text in light mode
    },
    featureTitle: {
        fontWeight: 'bold',
        color: '#000', // Black text in light mode
    },
    imgContainer: {
        alignItems: 'center'
    },
    image: {
        width: 100,
        height: 100
    }
});

export default Description;
