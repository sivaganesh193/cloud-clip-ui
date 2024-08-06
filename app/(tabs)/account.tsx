import React, { useCallback, useContext, useEffect, useState } from 'react';
import { StyleSheet, TextInput, View, Text, TouchableOpacity, SafeAreaView, FlatList, Platform } from 'react-native';
import { useColorScheme } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { AuthContext } from '@/auth/AuthContext';
import { collection, doc, getDocs, query, Timestamp, updateDoc, where } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import Header from '@/components/Header';
import { useNavigation } from '@react-navigation/native';

interface Device {
  userId: string;
  deviceName: string;
  os: string;
}

export default function Account() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const { user, logout } = useContext(AuthContext);

  const [name, setName] = useState(user?.name || ''); // Initialize state with user data if available
  const [mobile, setMobile] = useState(user?.mobile || '');
  const email = user?.email || 'user@example.com'; // Use user's email if available
  const [userId, setUserId] = useState<string | null>(null);

  const [devices, setDevices] = useState<any[]>([]); // Define the type for the state

  const authContext = useContext(AuthContext); // Get AuthContext
  if (!authContext) {
    throw new Error("AuthContext must be used within an AuthProvider");
  }
  // const { user } = authContext; // Use AuthContext to get the user

  useEffect(() => {
    fetchUser();
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      console.log('Tab is focused');
      fetchUser();
      return () => {
        console.log('Tab is unfocused');
      };
    }, [])
  );

  const handleSave = () => {
    if (userId) {
      updateUser(userId, name);
    }
  };

  const handleRemove = (title: string) => {
    console.log(`Share link: ${title}`);
  };

  const fetchUser = async () => {
    if (user) {
      try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", user.email));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          setName(data.name);
          setUserId(doc.id);
          fetchDevices();
        });
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    }
  };

  const fetchDevices = async () => {
    if (user) {
      try {
        console.log(userId);
        const devicesRef = collection(db, 'devices');
        const q = query(devicesRef, where('userId', '==', userId));
        const querySnapshot = await getDocs(q);
        const devicesList: Device[] = querySnapshot.docs.map(doc => doc.data() as Device);
        setDevices(devicesList);
        console.log('devices', devicesList);
      } catch (error) {
        console.error('Error fetching devices: ', error);
      }
    }
  };

  const updateUser = async (id: string, name: string) => {
    try {
      const userDocRef = doc(db, 'users', id);
      await updateDoc(userDocRef, {
        name: name,
        updatedAt: Timestamp.now()
      });
      console.log(`User with ID ${id} updated successfully`);
    } catch (error) {
      console.error('Error updating user: ', error);
    }
  };

  const handleLogout = () => {
    logout(); // Call the logout function from useAuth
  };

  const navigation = useNavigation();

  return (
    <SafeAreaView style={isDarkMode ? styles.safeAreaDark : styles.safeAreaLight}>
      <Header navigation={navigation} />
      <ThemedView style={isDarkMode ? styles.containerDark : styles.containerLight}>
        {user ? (
          <View style={styles.content}>
            <ThemedText type="title" style={styles.text}>Your Account</ThemedText>
            <Text>{'\n'}</Text>
            <View style={styles.fieldContainer}>
              <ThemedText type="subtitle" style={styles.text}>Email</ThemedText>
              <TextInput
                style={isDarkMode ? styles.inputDark : styles.inputLight}
                value={email}
                editable={false}
                placeholderTextColor={isDarkMode ? '#999' : '#999'}
              />
            </View>

            <View style={styles.fieldContainer}>
              <ThemedText type="subtitle" style={styles.text}>Name</ThemedText>
              <TextInput
                style={isDarkMode ? styles.inputDark : styles.inputLight}
                onChangeText={setName}
                value={name}
                placeholder="Enter your name"
                placeholderTextColor={'slategrey'}
              />
            </View>

            <View style={styles.fieldContainer}>
              <ThemedText type="subtitle" style={styles.text}>Mobile</ThemedText>
              <TextInput
                style={isDarkMode ? styles.inputDark : styles.inputLight}
                onChangeText={setMobile}
                value={mobile}
                placeholder="Enter your mobile number"
                placeholderTextColor={'slategrey'}
                keyboardType="phone-pad"
              />
            </View>

            <TouchableOpacity
              style={isDarkMode ? styles.buttonDark : styles.buttonLight}
              onPress={handleSave}
            >
              <Text style={isDarkMode ? styles.buttonTextDark : styles.buttonTextLight}>Save</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Text style={styles.logoutButtonText}>Click here to logout!</Text>
            </TouchableOpacity>

          </View>
        ) : (
          <ThemedView style={styles.containerCenter}>
            <MaterialCommunityIcons name="hand-wave" size={24} color="black"/>
            <ThemedText type="subtitle" style={styles.textLight}>Hi there! {'\n'}</ThemedText>
            <ThemedText type="subtitle" style={styles.textLight}>Welcome! Please log in to access your account and enjoy personalized features.
            </ThemedText>
          </ThemedView>
        )}
      </ThemedView >
      <ThemedText type="subtitle">My Devices</ThemedText>
      <FlatList
          data={devices}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={isDarkMode ? styles.itemContainerLight : styles.itemContainerLight}>
              <View>
                <Text style={isDarkMode ? styles.itemTitleDark : styles.itemTitleLight}>{item.deviceName}</Text>
                <Text style={isDarkMode ? styles.itemExpiryDark : styles.itemExpiryLight}>Expires in: {item.os}</Text>
              </View>
              <TouchableOpacity onPress={() => handleRemove(item.title)}>
                <Ionicons name="sync-outline" size={24} color={'black'} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleRemove(item.title)}>
                <Ionicons name="trash-outline" size={24} color={'black'} />
              </TouchableOpacity>
            </View>
          )}
          contentContainerStyle={styles.listContent}
        />
    </SafeAreaView >
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
  text: {
    color: '#000',
  },
  containerLight: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
  },
  containerDark: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    // borderRadius: 16,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  textLight: {
    fontSize: 16,
    color: '#000',
  },
  textDark: {
    fontSize: 16,
    color: '#000',
  },
  inputLight: {
    height: 40,
    borderColor: '#000',
    borderWidth: 1,
    marginTop: 2,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
    color: '#000',
  },
  inputDark: {
    height: 40,
    borderColor: '#000',
    borderWidth: 1,
    marginTop: 2,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
    color: '#000',
  },
  buttonLight: {
    marginTop: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#000',
    alignItems: 'center',
  },
  buttonDark: {
    marginTop: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#000',
    alignItems: 'center',
  },
  buttonTextLight: {
    color: '#fff',
    fontSize: 16,
  },
  buttonTextDark: {
    color: '#fff',
    fontSize: 16,
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
  containerCenter: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    width: Platform.OS === 'web' ? '50%' : '100%', // Center content on web, full width on mobile
    alignSelf: Platform.OS === 'web' ? 'center' : 'stretch', // Center align on web
  },
  logoutButton: {
    marginTop: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: 'transparent',
    alignItems: 'center'
  },
  logoutButtonText: {
    fontWeight: 'bold',
    cursor: 'pointer'
  }
});
