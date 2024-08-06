import LoginPopup from '@/app/Login';
import React, { useState, useContext } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { AuthContext } from '@/auth/AuthContext'; // Import AuthContext

const Header = ({ navigation }: { navigation: any }) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const { user, logout } = useContext(AuthContext); // Get user and logout from AuthContext
 
  const openModal = () => setModalVisible(true);
  const closeModal = () => setModalVisible(false);

  const handleSuccess = () => {
    closeModal();
  };

  const handleLogout = async () => {
    try {
      await logout(); // Call logout from AuthContext
    } catch (error) {
      console.error('Error logging out: ', error);
    }
  };

  return (
    <View style={styles.header}>
      <View style={styles.logoContainer}>
        <Image source={require('@/assets/images/logo.png')} style={styles.logo} />
        <Text style={styles.headerTitle}>Cloud-Clip</Text>
      </View>
      {!user ? (
        <TouchableOpacity style={styles.loginButton} onPress={openModal}>
          <Text style={styles.loginButtonText}>Log In</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.loginButton} onPress={handleLogout}>
          <Text style={styles.loginButtonText}>Log Out</Text>
        </TouchableOpacity>
      )}
      <LoginPopup
        isVisible={isModalVisible}
        onClose={closeModal}
        onSuccess={handleSuccess}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 65,
    height: 40,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  loginButton: {
    padding: 10,
    backgroundColor: '#000',
    borderRadius: 5,
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default Header;
