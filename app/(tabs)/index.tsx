import React, { useEffect, useState, useContext } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, ScrollView, TextInput, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import Header from '../../components/Header';
import Description from '@/components/Description';
import { useNavigation } from 'expo-router';
import { AuthContext } from '@/auth/AuthContext'; // Import AuthContext
import ClipboardScreen from '@/components/Clipboard';
import { getClipboard, setClipboard } from '@/service/clipboardService';
import { createClipboardEntry, fetchClipboardEntries, fetchDevices } from '@/service/firebaseService';
import { Clipboard } from '@/service/models';
import { getDeviceId, setDeviceId } from '@/service/deviceService';

export default function Homepage() {
	const colorScheme = useColorScheme();
	const isDarkMode = colorScheme === 'dark';

	const [data, setData] = useState("");
	const [currentDeviceId, setCurrentDeviceId] = useState<string | null>(null);
	const [clipboardEntries, setClipboardEntries] = useState<Clipboard[]>([]);

	const authContext = useContext(AuthContext); // Get AuthContext
	if (!authContext) {
		// Handle the case where AuthContext is undefined
		throw new Error("AuthContext must be used within an AuthProvider");
	}
	const { user } = authContext; // Use AuthContext to get the user
	const navigation = useNavigation();

	const handleCopy = (text: string) => {
		setClipboard(text);
	};

	const handleSave = (text: string) => {
		if (user && currentDeviceId) {
			createClipboardEntry({ userId: user.uid, deviceId: currentDeviceId, content: text }).then(() => {
				getClipboardData();
			});
		}
	};

	const getDeviceDetails = async () => {
		// console.log(user,currentDeviceId);
		if (user && !currentDeviceId) {
			const deviceId = await getDeviceId();
			if (deviceId) {
				const devices: any[] = []
				// await fetchDevices(user.uid);
				devices.forEach((device) => {
					if (device.deviceId?.includes(deviceId)) {
						setDeviceId(device.deviceId);
						setCurrentDeviceId(device.deviceId)
					}
				})
			}
		}
	};

	const getClipboardData = async () => {
		getDeviceDetails();
		if (user) {
			fetchClipboardEntries(user.uid)
				.then((data) => setClipboardEntries(data));
		}
	};

	useEffect(() => {
		const initialize = async () => {
			try {
				// Fetch clipboard data immediately
				await getClipboardData();

				const clipboardIntervalId = setInterval(() => {
					getClipboard()
						.then((text) => {
							// setData(text)
						})
						.catch((err) => console.log(err));
				}, 1000);

				// Start the second interval to fetch clipboard entries every 5 seconds
				const dataIntervalId = setInterval(() => {
					getClipboardData();
				}, 2147483647);

				// Cleanup both intervals on unmount
				return () => {
					clearInterval(clipboardIntervalId);
					clearInterval(dataIntervalId);
				};
			} catch (error) {
				console.error('Error during initialization:', error);
			}
		};

		initialize();
	}, [user]);

	return (
		<ScrollView
			contentContainerStyle={{ flexGrow: 1 }}
			showsVerticalScrollIndicator={false} // Optional: hides the vertical scrollbar
			horizontal={false} // Ensures horizontal scrolling is disabled
		>
			<SafeAreaView style={styles.safeArea}>
				<Header navigation={navigation} />
				<ThemedView style={styles.centerContainer}>
					{!user ? (
						<Description />
					) : (
						<>
							<ThemedView style={styles.container}>
								<View style={styles.headerWithButton}>
									<ThemedText type="subtitle" style={styles.text}>Your latest copied text</ThemedText>
									<TouchableOpacity style={[styles.copyButton, { marginLeft: 10 }]} onPress={() => handleCopy(data)}>
										<Ionicons name="clipboard-outline" size={24} color={isDarkMode ? 'black' : 'black'} />
										{Platform.OS === 'web' && (
											<Text style={[styles.copyButtonText, { color: isDarkMode ? 'black' : 'black' }]}> Copy Text</Text>
										)}
									</TouchableOpacity>
									<TouchableOpacity style={styles.copyButton} onPress={() => handleSave(data)}>
										<Ionicons name="save-outline" size={24} color={isDarkMode ? 'black' : 'black'} />
										{Platform.OS === 'web' && (
											<Text style={[styles.copyButtonText, { color: isDarkMode ? 'black' : 'black' }]}> Save Text</Text>
										)}
									</TouchableOpacity>
								</View>
								<View style={styles.textBox}>
									<TextInput
										style={[styles.text, styles.textInput]}
										value={data}
										onChangeText={setData}
										multiline={true} // Allows text to wrap and expand vertically
										editable={true} // Makes the text input editable
									/>
								</View>
							</ThemedView>
							<ThemedView style={styles.container}>
								<View style={styles.headerWithButton}>
									<ThemedText type="subtitle" style={styles.text}>Your Clipboard Entries</ThemedText>
								</View>
								<ClipboardScreen clipboardEntries={clipboardEntries} refreshData={getClipboardData} />
							</ThemedView>
						</>
					)}
				</ThemedView>
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
	text: {
		color: '#000'
	},
	centerContainer: {
		backgroundColor: '#fff',
		padding: 16,
		borderRadius: 16,
	},
	container: {
		backgroundColor: '#fff',
		padding: 16,
		borderRadius: 16,
		overflow: 'hidden'
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
		backgroundColor: '#fff',
		shadowColor: '#000',
		shadowOpacity: 0.1,
		shadowOffset: { width: 0, height: 2 },
		shadowRadius: 8,
		elevation: 3,
	},
	itemContainerDark: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		padding: 16,
		marginBottom: 16,
		borderRadius: 8,
		backgroundColor: '#1e1e1e',
		shadowColor: '#000',
		shadowOpacity: 0.1,
		shadowOffset: { width: 0, height: 2 },
		shadowRadius: 8,
		elevation: 3,
	},
	itemTitleLight: {
		fontSize: 18,
		color: '#000',
	},
	itemTitleDark: {
		fontSize: 18,
		color: '#fff',
	},
	itemExpiryLight: {
		fontSize: 14,
		color: '#666',
	},
	itemExpiryDark: {
		fontSize: 14,
		color: '#aaa',
	},
	itemContent: {
		flex: 1,
	},
	mainClipContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 10,
	},
	mainClipContent: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 10,
		borderRadius: 5,
	},
	mainClipContentLight: {
		backgroundColor: '#fff',
		shadowColor: '#000',
		shadowOpacity: 0.1,
		shadowOffset: { width: 0, height: 2 },
		shadowRadius: 8,
		elevation: 3,
	},
	mainClipContentDark: {
		backgroundColor: '#1e1e1e',
		shadowColor: '#000',
		shadowOpacity: 0.1,
		shadowOffset: { width: 0, height: 2 },
		shadowRadius: 8,
		elevation: 3,
	},
	buttonContainer: {
		flexDirection: 'row',
		marginLeft: 10,
	},
	textBox: {
		flex: 1,
		borderWidth: 1,         // Thickness of the border
		borderColor: '#000',    // Color of the border
		borderRadius: 0         // Optional: Rounds the corners of the border
	},
	headerWithButton: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		width: '100%',
	},
	copyButton: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 8,
		borderRadius: 5,
	},
	copyButtonText: {
		marginLeft: 5,
		fontWeight: 'bold',
	},
	scrollView: {
		flex: 1,
	},
	textInput: {
		minHeight: 180,
		flex: 1,
		textAlignVertical: 'top',
		padding: 10,
	},
});
