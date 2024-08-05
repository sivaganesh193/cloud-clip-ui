import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, useColorScheme, Alert, TouchableOpacity, Image, Text, Dimensions } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { auth } from '../firebaseConfig'; // Import Firebase auth
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { Octicons } from '@expo/vector-icons';

// Configure Google Sign-In
GoogleSignin.configure({
  webClientId: '1022149034466-us90pmkv8muvv1juq2cn8tveihjt5nb4.apps.googleusercontent.com', // Replace with your actual web client ID
});


const Login = ({ navigation }: any) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(Dimensions.get('window').width);
    };

    Dimensions.addEventListener('change', handleResize);
  }, []);

  const descWidth = screenWidth * 0.4;

  useEffect(() => {
    // Check if the user is already signed in
    const checkUser = async () => {
      const userInfo = await GoogleSignin.getCurrentUser();
      if (userInfo) {
        navigation.navigate('Homepage');
      }
    };
    checkUser();
  }, [navigation]);

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, username, password);
      navigation.navigate('Homepage');
    } catch (error: any) {
      Alert.alert("Login Error", error.message);
    }
  };

  const handleSignUp = async () => {
    // Handle sign-up logic here
    // Ensure all fields are filled and passwords match
    if (password !== confirmPassword) {
      Alert.alert("Password Error", "Passwords do not match.");
      return;
    }

    // Perform sign-up logic (e.g., create a new user with Firebase)
    // Example: await createUserWithEmailAndPassword(auth, username, password);

    // Navigate to Homepage or another screen after successful sign-up
    navigation.navigate('Homepage');
  };

  const handleGoogleSignIn = async () => {
    try {
      const { idToken } = await GoogleSignin.signIn();
      const credential = GoogleAuthProvider.credential(idToken);
      await signInWithCredential(auth, credential);
      navigation.navigate('Homepage');
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        Alert.alert("Login Cancelled");
      } else if (error.code === statusCodes.IN_PROGRESS) {
        Alert.alert("Sign in in progress");
      } else {
        Alert.alert("Login Error", error.message);
      }
    }
  };

  return (
    <ThemedView style={[isDarkMode ? styles.containerDark : styles.containerLight, { width: descWidth }]}>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, !isSignUpMode && styles.activeButton]}
          onPress={() => setIsSignUpMode(false)}
        >
          <Text style={styles.secondarybuttonText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, isSignUpMode && styles.activeButton]}
          onPress={() => setIsSignUpMode(true)}
        >
          <Text style={styles.secondarybuttonText}>Sign Up</Text>
        </TouchableOpacity>
      </View>

      {isSignUpMode ? (
        <>
          <TextInput
            style={styles.input}
            placeholder="Name"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={username}
            onChangeText={setUsername}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <TouchableOpacity style={styles.button} onPress={handleSignUp}>
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={username}
            onChangeText={setUsername}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
        </>
      )}

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.googleButton} onPress={() => navigation.navigate('ForgotPassword')}>
          <Octicons name="question" size={24} color="black" style={styles.googleIcon} />
          <Text style={styles.googleButtonContent}>Forgot Password</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignIn}>
          <View style={styles.googleButtonContent}>
            <Image source={require('../assets/images/google-icon.png')} style={styles.googleIcon} />
            <Text style={styles.googleButtonText}>Sign In with Google</Text>
          </View>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  containerLight: {
    
    alignSelf: 'center',
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  containerDark: {
    alignSelf: 'center',
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  toggleButton: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
    borderRadius: 0,
    marginHorizontal: 4,
    cursor: 'pointer'
  },
  activeButton: {
    borderRadius: 0,
    backgroundColor: 'transparent',
    borderBottomColor: '#000',
    borderBottomWidth: 3,
    cursor: 'pointer'
  },
  secondarybuttonText: {
    color: '#000',
    fontWeight: 'bold',
    textAlign: 'center'
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center'
  },
  button: {
    marginBottom: 12,
    backgroundColor: '#000',
    borderRadius: 5,
    padding: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 10
  },
  forgotPasswordButton: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
    borderRadius: 5,
    marginRight: 8,
    backgroundColor: '#ccc',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 5,
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    flex: 1,
  },
  googleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  googleButtonText: {
    color: '#000',
  },

});

export default Login;
