import React from 'react';
import { View, StyleSheet, Image, ImageBackground } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

const WelcomeScreen = ({ navigation }) => {
  const theme = useTheme();

  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80' }}
      style={styles.backgroundImage}
    >
      <StatusBar style="light" />
      <SafeAreaView style={styles.container}>
        <View style={styles.overlay}>
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>FoodSaver</Text>
            <Text style={styles.tagline}>Save Food. Save Money. Save the Planet.</Text>
          </View>

          <View style={styles.contentContainer}>
            <Text style={styles.description}>
              Connect with local businesses to purchase surplus food at great discounts and help reduce food waste.
            </Text>

            <View style={styles.buttonContainer}>
              <Button
                mode="contained"
                style={[styles.button, { backgroundColor: theme.colors.primary }]}
                labelStyle={styles.buttonLabel}
                onPress={() => navigation.navigate('Login')}
              >
                Login
              </Button>
              
              <Button
                mode="outlined"
                style={styles.button}
                labelStyle={[styles.buttonLabel, { color: '#FFFFFF' }]}
                onPress={() => navigation.navigate('Register')}
              >
                Register
              </Button>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 20,
    justifyContent: 'space-between',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  logo: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  tagline: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  contentContainer: {
    marginBottom: 60,
  },
  description: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 26,
  },
  buttonContainer: {
    width: '100%',
  },
  button: {
    marginVertical: 10,
    paddingVertical: 6,
    borderColor: '#FFFFFF',
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingVertical: 4,
  },
});

export default WelcomeScreen;
