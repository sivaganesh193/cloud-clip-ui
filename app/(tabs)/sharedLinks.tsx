import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet, FlatList, View, Text, TouchableOpacity, SafeAreaView, TextInput, Alert, Platform, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import Header from '@/components/Header';
import { useNavigation } from 'expo-router';
import { createClipboardEntry, createSharedLink, fetchSharedLinks } from '@/service/firebaseService';
import { AuthContext } from '@/auth/AuthContext';
import { getDomain } from '@/service/util';
import { getDeviceId } from '@/service/deviceService';
import { Shared } from '@/service/models';
import * as Clipboard from 'expo-clipboard';
import * as Crypto from 'expo-crypto';

export default function SharedLinks() {
	const colorScheme = useColorScheme();
	const isDarkMode = colorScheme === 'dark';
	const navigation = useNavigation();
	const [textToShare, setTextToShare] = useState("");
	const [currentDeviceId, setCurrentDeviceId] = useState<string | null>(null);
	const [sharedLinks, setSharedLinks] = useState<Shared[]>([]); // Define the type for the state

	const handleShare = async (content: string) => {
		try {
			if (user && currentDeviceId) {
				const clipRef = await createClipboardEntry({
					userId: user.uid,
					deviceId: currentDeviceId,
					content: content
				});
				console.log('id',clipRef);

				const sharedRef = await createSharedLink({
					userId: user.uid,
					clipboardId: clipRef,
					code: Crypto.randomUUID(), // will change url to smaller code
				})
				console.log('shared id',sharedRef);
				
				const linkCode = clipRef;
				const sharedLinkURL = `${getDomain()}/shared/${linkCode}`;
				console.log(sharedLinkURL);


				if (Platform.OS === 'web') {
					// Create a div to hold the message and the button
					const alertDiv = document.createElement('div');
					alertDiv.style.position = 'fixed';
					alertDiv.style.top = '50%';
					alertDiv.style.left = '50%';
					alertDiv.style.transform = 'translate(-50%, -50%)';
					alertDiv.style.backgroundColor = 'white';
					alertDiv.style.padding = '20px';
					alertDiv.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
					alertDiv.style.zIndex = '1000'; // Make sure it's on top of other elements

					// Create a paragraph to display the message
					const message = document.createElement('p');
					message.innerText = `Share this link to view the text you just shared:\n${sharedLinkURL}`;
					alertDiv.appendChild(message);

					// Create the "Copy Link" button
					const copyButton = document.createElement('button');
					copyButton.innerText = 'Copy Link';
					copyButton.style.marginRight = '10px';
					copyButton.onclick = () => {
						navigator.clipboard.writeText(sharedLinkURL).then(() => {
							alert('Link copied to clipboard!');
						}).catch(err => {
							console.error('Could not copy text: ', err);
						});
					};
					alertDiv.appendChild(copyButton);
					const closeButton = document.createElement('button');
					closeButton.innerText = 'Close';
					closeButton.onclick = () => {
						document.body.removeChild(alertDiv);
					};
					alertDiv.appendChild(closeButton);
					document.body.appendChild(alertDiv);
					setTimeout(() => {
						document.body.removeChild(alertDiv);
					}, 3000);
				} else {
					// Mobile: Show alert with copy button
					Alert.alert(
						'Link Generated!',
						`Share this link to view the text:\n${sharedLinkURL}`,
						[
							{
								text: 'Copy Code',
								onPress: () => {
									Clipboard.setString(linkCode); // Copy to clipboard for React Native
									Alert.alert('Code copied to clipboard!');
								},
							},
							{
								text: 'View Link',
								onPress: () => {
									Linking.openURL(sharedLinkURL); // Open the link
								},
							},
							{ text: 'OK' }
						]
					);
				}

				console.log(`Shared link created with ID: ${linkCode}`);
			}

		} catch (error) {
			console.error('Error creating shared link: ', error);
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
			console.log(shared);
			setSharedLinks(shared);
		}
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
				}, 5000);

				// Cleanup the interval on unmount
				return () => clearInterval(intervalId);
			} catch (error) {
				console.error('Error during initialization:', error);
			}
		};

		initialize();
	}, [user, currentDeviceId]);

	return (
		<SafeAreaView style={isDarkMode ? styles.safeAreaDark : styles.safeAreaLight}>
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
							<View style={isDarkMode ? styles.itemContainerLight : styles.itemContainerLight}>
								<View>
									<Text style={isDarkMode ? styles.itemTitleDark : styles.itemTitleLight}>{item.clipboardId}</Text>
									<Text style={isDarkMode ? styles.itemExpiryDark : styles.itemExpiryLight}>Expires in: {item.expiryAt?.toString()}</Text>
								</View>
								<View style={styles.buttonContainer}>
									<TouchableOpacity style={styles.button}>
										<Ionicons name="trash-outline" size={24} color={'black'} />
									</TouchableOpacity>
									<TouchableOpacity style={styles.button}>
										<Ionicons name="share-social-outline" size={24} color={'black'} />
									</TouchableOpacity>
								</View>
							</View>
						)}
						contentContainerStyle={styles.listContent}
					/>
				</ThemedView>
			)}
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeAreaLight: {
		flex: 1,
		backgroundColor: '#fff',
		padding: 16,
	},
	safeAreaDark: {
		flex: 1,
		backgroundColor: '#fff',
		padding: 16,
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
	itemContainerDark: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		padding: 16,
		marginBottom: 16,
		borderRadius: 8,
		backgroundColor: '#fff',
		shadowColor: '#000',
		shadowOpacity: 0.1,
		shadowOffset: { width: 0, height: 2 },
		shadowRadius: 8,
		elevation: 3,
	},
	buttonContainer: {
		flexDirection: 'row',     // Align buttons in a row
		justifyContent: 'flex-end',  // Align buttons to the right end
		alignItems: 'center',     // Align buttons vertically center
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
