import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, View, Text, TouchableOpacity, SafeAreaView, TextInput, Platform, ScrollView } from 'react-native';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import Header from '@/components/Header';
import { router, useNavigation } from 'expo-router';
import { deleteSharedLink, listenToSharedLinks } from '@/service/firebaseService';
import { useAuth } from '@/auth/AuthContext';
import { truncateContent } from '@/service/util';
import { Shared } from '@/service/models';
import * as Crypto from 'expo-crypto';
import { Timestamp } from 'firebase/firestore';
import { setClipboard } from '@/service/clipboardService';
import useDeviceDetails from '@/hook/useDeviceDetails';
import NoItemsComponent from '@/components/NoItems';
import Alert from '@/components/Alert';
import Confirmation from '@/components/Confirmation';
import { getSharedLinkURL, handleShare } from '@/service/shareService';

export default function SharedLinks() {
	const colorScheme = useColorScheme();
	const isDarkMode = colorScheme === 'dark';
	const navigation = useNavigation();
	const [textToShare, setTextToShare] = useState("");
	const [retrieveText, setRetrieveText] = useState("");
	const [sharedLinks, setSharedLinks] = useState<Shared[]>([]); // Define the type for the state
	const { deviceId, deviceName } = useDeviceDetails();
	const [confirmationVisible, setConfirmationVisible] = useState(false);
	const [itemToRemoveId, setItemToRemoveId] = useState("");
	const [alertVisible, setAlertVisible] = useState(false);
	const [alertMessage, setAlertMessage] = useState('');

	const showAlert = (message: string) => {
		setAlertMessage(message);
		setAlertVisible(true);
		setTimeout(() => setAlertVisible(false), 3000); // Dismiss alert after 3 seconds
	};

	const { user } = useAuth(); // Use AuthContext to get the user

	const handleRemove = () => {
		deleteSharedLink(itemToRemoveId);
		setConfirmationVisible(false);
	};

	const handleShareLink = (code: string) => {
		const url = getSharedLinkURL(code);
		setClipboard(url, showAlert, "Link copied to clipboard."); // Pass the showAlert function
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
				// Only set up the listener if user and deviceId are available
				if (user && deviceId) {
					// Define unsubscribe function
					const unsubscribe = listenToSharedLinks(user.uid, setSharedLinks);

					// Cleanup the listener on unmount
					return () => unsubscribe();
				}
			} catch (error) {
				console.error('Error during initialization:', error);
			}
		};
		// Run the initialize function
		initialize();
	}, [user, deviceId]);


	const handleCancel = () => {
		setConfirmationVisible(false);
	};

	const showConfirmation = (item: any) => {
		setConfirmationVisible(true);
		setItemToRemoveId(item.id);
	}
	return (
		<>
			<Alert message={alertMessage} visible={alertVisible} />
			<Confirmation
				message="Are you sure you want to proceed?"
				visible={confirmationVisible}
				onConfirm={handleRemove}
				onCancel={handleCancel}
			/>
			<ScrollView
				contentContainerStyle={{ flexGrow: 1 }}
				showsVerticalScrollIndicator={false}
				horizontal={false}
			>
				<SafeAreaView style={styles.safeArea}>
					<Header navigation={navigation} />
					<ThemedView style={styles.containerLight}>
						<ThemedText type="defaultSemiBold" style={styles.heading}>
							Paste your text here and click on Share to easily share text with friends!
						</ThemedText>
						<ThemedView style={[{ flexDirection: 'row', alignItems: 'center', gap: 20 }]}>
							<TextInput
								style={styles.inputLight}
								placeholder="Enter text to share"
								placeholderTextColor={isDarkMode ? '#000' : '#000'}
								value={textToShare}
								onChangeText={(text) => setTextToShare(text)}
							/>
							<TouchableOpacity
								style={styles.tertiaryButton}
								onPress={() => handleShare(textToShare, user, deviceId, deviceName, showAlert, setTextToShare)}
							>
								<Ionicons name="share-social-outline" size={24} color={'black'} />
								<ThemedText type="default" style={styles.tertiaryButtonText} >
									Share
								</ThemedText>
							</TouchableOpacity>
						</ThemedView>
					</ThemedView>
					<ThemedView style={[styles.containerLight]}>
						<ThemedText type="defaultSemiBold" lightColor='black' darkColor='black' style={styles.heading}>Retrieve Text:</ThemedText>
						<ThemedView style={[{ flexDirection: 'row', alignItems: 'center', gap: 20 }]}>
							<TextInput
								style={styles.inputLight2}
								placeholder="Enter the code here to retrieve your text"
								placeholderTextColor={isDarkMode ? '#000' : '#000'}
								value={retrieveText}
								onChangeText={(text) => setRetrieveText(text)}
							/>
							<TouchableOpacity
								style={styles.tertiaryButton}
								onPress={() => {
									if (!retrieveText.trim()) {
										showAlert("Please enter a code to retrieve your text.");
									} else {
										router.push(`/shared/${retrieveText}`);
									}
								}}
							>
								<Ionicons name="share-outline" size={24} color="black" />
								<ThemedText type="default" style={styles.tertiaryButtonText}>Retrieve</ThemedText>
							</TouchableOpacity>
						</ThemedView>
					</ThemedView>
					{user && (
						<ThemedView style={styles.containerLight}>
							<ThemedText type="defaultSemiBold" lightColor='black' darkColor='black'>Recent Shared Links: </ThemedText>
							<Text>{'\n'}</Text>
							<View style={styles.flatListContainer}>
								{sharedLinks.length > 0 ? (
									<FlatList
										data={sharedLinks}
										keyExtractor={(item) => item.id || Crypto.randomUUID()}
										renderItem={({ item }) => (
											<TouchableOpacity onPress={() => router.push(`/shared/${item.code || ''}`)}>
												<View style={styles.itemContainerLight}>
													<View style={styles.textContainer}>
														<Text style={isDarkMode ? styles.itemTitleDark : styles.itemTitleLight}>
															{truncateContent(item.content || "")}
														</Text>
														<Text style={isDarkMode ? styles.itemExpiryDark : styles.itemExpiryLight}>
															Expires in: {calculateTimeLeft(item.expiryAt || null)}
														</Text>
													</View>
													<View style={styles.buttonContainer}>
														<TouchableOpacity style={styles.button} onPress={() => showConfirmation(item)}>
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
									/>) : (
									<NoItemsComponent></NoItemsComponent>
								)}
							</View>
						</ThemedView>
					)}
				</SafeAreaView>
			</ScrollView>
		</>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: '#fff',
		paddingTop: Platform.OS === 'web' ? 0 : 30,
	},
	flatListContainer: {
		height: 300,
		paddingRight: 5,
		marginBottom: 10,
	},
	scrollContainer: {
		padding: 10,
	},
	containerLight: {
		backgroundColor: '#fff',
		padding: 16,
		marginLeft: Platform.OS === 'web' ? 20 : 0,
		marginRight: Platform.OS === 'web' ? 20 : 0,
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
		fontSize: 16,
		color: '#000',
	},
	itemTitleDark: {
		fontSize: 16,
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
		// fontSize: 16,
		// color: '#000',
		// textAlign: 'center',
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
		width: Platform.OS === 'web' ? '70%' : '100%',
	},
	inputLight2: {
		height: 40,
		borderColor: '#000',
		borderWidth: 1,
		borderRadius: 8,
		paddingHorizontal: 8,
		backgroundColor: '#fff',
		color: '#000',
		marginBottom: 16,
		width: '70%',
		alignSelf: 'center'
	},
	shareButton: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		paddingVertical: 5,
		width: 150,
		alignSelf: 'center',
		borderRadius: 8,
		backgroundColor: 'black',
		marginBottom: 15
	},
	shareButtonText: {
		color: '#fff',
		fontSize: 16,
		marginLeft: 8,
	},
	tertiaryButton: {
		flexDirection: 'row',
		width: 150,
		marginBottom: 15,
		textAlign: 'left',
		borderRadius: 8,
		backgroundColor: '#fff',
	},
	tertiaryButtonText: {
		color: '#000',
		fontSize: 16,
		marginLeft: 8,
		fontWeight: 'bold',
		textDecorationColor: 'black',
		textDecorationStyle: 'solid',
		textDecorationLine: 'underline'

	}
});
