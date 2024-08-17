import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet, FlatList, View, Text, TouchableOpacity, SafeAreaView, TextInput, Alert, Platform, Linking, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import Header from '@/components/Header';
import { router, useNavigation } from 'expo-router';
import { createClipboardEntry, createSharedLink, deleteSharedLink, fetchSharedLinks } from '@/service/firebaseService';
import { AuthContext } from '@/auth/AuthContext';
import { getDomain, truncateContent } from '@/service/util';
import { getDeviceId } from '@/service/deviceService';
import { Shared } from '@/service/models';
import * as Clipboard from 'expo-clipboard';
import * as Crypto from 'expo-crypto';
import { Timestamp } from 'firebase/firestore';
import { setClipboard } from '@/service/clipboardService';

export default function SharedLinks() {
	const colorScheme = useColorScheme();
	const isDarkMode = colorScheme === 'dark';
	const navigation = useNavigation();
	const [textToShare, setTextToShare] = useState("");
	const [currentDeviceId, setCurrentDeviceId] = useState<string | null>(null);
	const [sharedLinks, setSharedLinks] = useState<Shared[]>([]); // Define the type for the state

	const getSharedLinkURL = (code: string): string => {
		const sharedLinkURL = `${getDomain()}/shared/${code}`;
		console.log(sharedLinkURL);
		return sharedLinkURL;
	}

	const handleShare = async (content: string) => {
		if (content) {
			try {
				if (user && currentDeviceId) {
					const clipRef = await createClipboardEntry({
						userId: user.uid,
						deviceId: currentDeviceId,
						content: content
					});
					const sharedRef = await createSharedLink({
						userId: user.uid,
						clipboardId: clipRef,
						code: Crypto.randomUUID(), // will change url to smaller code
					})
					const linkCode = clipRef;
					const sharedLinkURL = getSharedLinkURL(linkCode);
					await setClipboard(sharedLinkURL);
					setTextToShare('');
				}

			} catch (error) {
				console.error('Error creating shared link: ', error);
			}
		}
		else {
			window.alert('Please enter text to share'); // use saroja common alert
		}
	};

	const authContext = useContext(AuthContext); // Get AuthContext
	if (!authContext) {
		// Handle the case where AuthContext is undefined
		throw new Error("AuthContext must be used within an AuthProvider");
	}
	const { user } = authContext; // Use AuthContext to get the user

	const fetchData = async () => {
		if (user && currentDeviceId) {
			const shared = await fetchSharedLinks(user.uid);
			setSharedLinks(shared);
		}
	};

	const handleRemove = (id: string) => {
		deleteSharedLink(id).then(() => fetchData());
	};

	const handleShareLink = (code: string) => {
		const url = getSharedLinkURL(code);
		console.log(url);
	};


	const calculateTimeLeft = (expiryAt: Timestamp | null): string => {
		if (!expiryAt) {
			return '';
		}
		const now = Date.now(); // Current time in milliseconds
		const expiryTime = expiryAt.toMillis(); // Convert Timestamp to milliseconds
		const timeLeft = expiryTime - now;
		if (timeLeft <= 0) {
			return 'Expired';
		}
		const minutes = Math.floor((timeLeft / (1000 * 60)) % 60);
		const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
		return `${hours}h ${minutes}m`;
	};

	useEffect(() => {
		const initialize = async () => {
			try {
				// Fetch device ID and user details concurrently
				const deviceId = await getDeviceId();
				setCurrentDeviceId(deviceId);

				if (deviceId) {
					fetchData();
				}

				// Start the interval only after the currentDeviceId is set
				const intervalId = setInterval(() => {
					fetchData();
				}, 2147483647);

				// Cleanup the interval on unmount
				return () => clearInterval(intervalId);
			} catch (error) {
				console.error('Error during initialization:', error);
			}
		};

		initialize();
	}, [user, currentDeviceId]);

	return (
		<ScrollView
			contentContainerStyle={{ flexGrow: 1 }}
			showsVerticalScrollIndicator={false} // Optional: hides the vertical scrollbar
			horizontal={false} // Ensures horizontal scrolling is disabled
		>
			<SafeAreaView style={styles.safeArea}>
				<Header navigation={navigation} />
				<ThemedView style={styles.containerDark}>
					<ThemedText type="title" style={styles.heading}>
						Paste your text here and click on Share to easily share text with friends!
					</ThemedText>

					<TextInput
						style={isDarkMode ? styles.inputDark : styles.inputLight}
						placeholder="Enter text to share"
						placeholderTextColor={isDarkMode ? '#000' : '#000'}
						value={textToShare}
						onChangeText={(text) => setTextToShare(text)}
					/>
					<TouchableOpacity
						style={styles.shareButton}
						onPress={() => handleShare(textToShare)}
					>
						<Ionicons name="share-outline" size={24} color="white" />
						<ThemedText type="default" style={styles.shareButtonText} >
							Share
						</ThemedText>
					</TouchableOpacity>
				</ThemedView>
				{user && (
					<ThemedView style={isDarkMode ? styles.containerDark : styles.containerLight}>
						<ThemedText type="subtitle" lightColor='black' darkColor='black'>Recent Shared Links: </ThemedText>
						<Text>{'\n'}</Text>
						<FlatList
							data={sharedLinks}
							keyExtractor={(item) => item.id || Crypto.randomUUID()}
							renderItem={({ item }) => (
								<TouchableOpacity onPress={() => router.push(`/shared/${item.id || ''}`)}>
									<View style={styles.itemContainerLight}>
										<View style={styles.textContainer}>
											<Text style={isDarkMode ? styles.itemTitleDark : styles.itemTitleLight}>{truncateContent(item.clipboardContent || "")}</Text>
											<Text style={isDarkMode ? styles.itemExpiryDark : styles.itemExpiryLight}>Expires in: {calculateTimeLeft(item.expiryAt || null)}</Text>
										</View>
										<View style={styles.buttonContainer}>
											<TouchableOpacity style={styles.button} onPress={() => handleRemove(item.id || '')}>
												<Ionicons name="trash-outline" size={24} color={'black'} />
											</TouchableOpacity>
											<TouchableOpacity style={styles.button} onPress={() => handleShareLink(item.code)}>
												<Ionicons name="share-social-outline" size={24} color={'black'} />
											</TouchableOpacity>
										</View>
									</View>
								</TouchableOpacity>
							)}
							contentContainerStyle={styles.listContent}
						/>
					</ThemedView>
				)}
			</SafeAreaView>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: '#fff',
		paddingTop: Platform.OS === 'web' ? 0 : 18,
	},
	containerLight: {
		// flex: 1,
		backgroundColor: '#fff',
		padding: 16,
		// borderRadius: 16,
	},
	containerDark: {
		// flex: 1,
		backgroundColor: '#fff',
		padding: 16,
		// borderRadius: 16,
	},
	listContent: {
		paddingBottom: 16,
	},
	itemContainerLight: {
		cursor: Platform.OS === 'web' ? 'pointer' : 'auto',
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		padding: 16,
		marginBottom: 16,
		borderRadius: 8,
		backgroundColor: '#f0f0f0',
		shadowColor: '#000',
		shadowOpacity: 0.1,
		shadowOffset: { width: 0, height: 2 },
		shadowRadius: 2,
		elevation: 2,
	},
	textContainer: {
		flex: 2, // Takes up the available space
		marginRight: 16, // Adds some space between text and icons
	},
	buttonContainer: {
		flexDirection: 'row',     // Align buttons in a row
		justifyContent: 'flex-end',  // Align buttons to the right end
		alignItems: 'center',     // Align buttons vertically center
		flex: 1
	},
	button: {
		marginLeft: 10
	},
	itemTitleLight: {
		fontSize: 18,
		color: '#000',
	},
	itemTitleDark: {
		fontSize: 18,
		color: '#000',
	},
	itemExpiryLight: {
		fontSize: 14,
		color: '#aaa',
	},
	itemExpiryDark: {
		fontSize: 14,
		color: '#aaa',
	},
	heading: {
		marginBottom: 16,
		fontSize: 18,
		color: '#000',
		textAlign: 'center',
	},
	inputLight: {
		height: 40,
		borderColor: '#000',
		borderWidth: 1,
		borderRadius: 8,
		paddingHorizontal: 8,
		backgroundColor: '#fff',
		color: '#000',
		marginBottom: 16,
	},
	inputDark: {
		height: 40,
		borderColor: '#000',
		borderWidth: 1,
		borderRadius: 8,
		paddingHorizontal: 8,
		backgroundColor: '#fff',
		color: '#000',
		marginBottom: 16,
	},
	shareButton: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		paddingVertical: 5,
		width: 200,
		alignSelf: 'center',
		borderRadius: 8,
		backgroundColor: 'black',
	},
	shareButtonText: {
		color: '#fff',
		fontSize: 16,
		// fontWeight: 'bold',
		marginLeft: 8,
	},
});
