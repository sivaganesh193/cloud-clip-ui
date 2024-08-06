import React, { useState, useEffect, useContext } from 'react';
import { View, TextInput, StyleSheet, useColorScheme, Alert, TouchableOpacity, Text, Dimensions, Modal, TouchableWithoutFeedback } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { auth } from '../firebaseConfig'; // Import Firebase auth
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { MaterialCommunityIcons, Octicons } from '@expo/vector-icons';
import { AuthContext } from '@/auth/AuthContext';

const LoginPopup = ({ isVisible, onClose, onSuccess }: { isVisible: boolean; onClose: () => void; onSuccess: () => void; }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // New state for showing password
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // New state for showing confirm password
  const [isForgotPasswordMode, setIsForgotPasswordMode] = useState(false); // New state for forgot password mode
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);

  const boxWidth = screenWidth * 0.8; // Adjust width as needed

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(Dimensions.get('window').width);
    };

    Dimensions.addEventListener('change', handleResize);

    // return () => {
    //   Dimensions.removeEventListener('change', handleResize); // Cleanup listener
    // };
  }, []);

  const resetFields = () => {
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setName('');
    setIsSignUpMode(false);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setIsForgotPasswordMode(false); // Reset forgot password mode
  };
  const authContext = useContext(AuthContext);

  if (!authContext) {
    throw new Error("AuthContext must be used within an AuthProvider");
  }

  const { setUser } = authContext;

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Input Error", "Please enter both email and password.");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, username, password);
      setUser(userCredential.user);
      console.log(userCredential);
      
      onSuccess();
      onClose();
      resetFields(); // Clear fields on successful login
    } catch (error: any) {
      let message = "An error occurred";
      if (error.code === 'auth/user-not-found') {
        message = "No user found with this email.";
      } else if (error.code === 'auth/wrong-password') {
        message = "Incorrect password.";
      }
      Alert.alert("Login Error", message);
    }
  };

  const handleSignUp = async () => {
    if (!username || !password || !confirmPassword || !name) {
      Alert.alert("Input Error", "Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Password Error", "Passwords do not match.");
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, username, password);
      onSuccess();
      onClose();
      resetFields(); // Clear fields on successful sign-up
    } catch (error: any) {
      let message = "An error occurred";
      if (error.code === 'auth/email-already-in-use') {
        message = "Email is already in use.";
      } else if (error.code === 'auth/weak-password') {
        message = "Password is too weak.";
      }
      Alert.alert("Sign Up Error", message);
    }
  };

  const handleForgotPassword = async () => {
    if (!username) {
      Alert.alert("Input Error", "Please enter your email address.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, username);
      Alert.alert("Success", "Password reset email sent.");
      setIsForgotPasswordMode(false); // Switch back to login mode
    } catch (error: any) {
      let message = "An error occurred";
      if (error.code === 'auth/user-not-found') {
        message = "No user found with this email.";
      }
      Alert.alert("Forgot Password Error", message);
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => {
        onClose();
        resetFields(); // Clear fields when modal is closed
      }}
    >
      <TouchableWithoutFeedback onPress={() => {
        onClose();
        resetFields(); // Clear fields when modal is closed
      }}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <ThemedView style={[styles.modalBox, isDarkMode ? styles.darkBox : styles.lightBox]}>
              {isForgotPasswordMode ? (
                <>
                  <Text style={styles.titleText}>Reset Password</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    value={username}
                    onChangeText={setUsername}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  <TouchableOpacity style={styles.button} onPress={handleForgotPassword}>
                    <Text style={styles.buttonText}>Send Reset Email</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setIsForgotPasswordMode(false)} style={styles.button}>
                    <Text style={styles.buttonText}>Back to Login</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
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
                        keyboardType="email-address"
                        autoCapitalize="none"
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="Password"
                        secureTextEntry={!showPassword}
                        value={password}
                        onChangeText={setPassword}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="Confirm Password"
                        secureTextEntry={!showConfirmPassword}
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
                        keyboardType="email-address"
                        autoCapitalize="none"
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="Password"
                        secureTextEntry={!showPassword}
                        value={password}
                        onChangeText={setPassword}
                      />

                      <TouchableOpacity style={styles.button} onPress={handleLogin}>
                        <Text style={styles.buttonText}>Login</Text>
                      </TouchableOpacity>
                    </>
                  )}

                  <View style={styles.buttonRow}>
                    <TouchableOpacity style={styles.forgotPasswordButton} onPress={() => setIsForgotPasswordMode(true)}>
                      <Octicons name="question" size={24} color="black" style={styles.forgotPasswordIcon} />
                      <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.forgotPasswordButton} onPress={() => Alert.alert('Signin with Google')}>
                      <MaterialCommunityIcons name="google" size={24} color="black" />
                      <Text style={styles.forgotPasswordText}>Signin with Google</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </ThemedView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalBox: {
    width: '80%',
    maxWidth: 400,
    height: 400,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    position: 'relative',
  },
  darkBox: {
    backgroundColor: '#fff',
  },
  lightBox: {
    backgroundColor: '#fff',
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
  },
  activeButton: {
    borderRadius: 0,
    backgroundColor: 'transparent',
    borderBottomColor: '#000',
    borderBottomWidth: 3,
  },
  secondarybuttonText: {
    color: '#000',
    fontWeight: 'bold',
    textAlign: 'center'
  },
  buttonText: {
    color: '#fff',
    // fontWeight: 'bold',
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
    flexDirection: 'row'
  },
  forgotPasswordIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  forgotPasswordText: {
    color: '#000',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  showPasswordButton: {
    position: 'absolute',
    right: 8,
    top: 8,
  },
  titleText: {
    fontSize: 18,
    color: '#000',
    marginBottom: 10
  },
});

export default LoginPopup;

