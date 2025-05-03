import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { Text, Button, TextInput, Avatar, Card, Divider, useTheme, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import { 
  fetchUserProfile, 
  updateUserProfile, 
  fetchUserImpactMetrics,
  selectUserProfile,
  selectUserImpactMetrics,
  selectUserLoading,
  selectUserError 
} from '../../store/slices/userSlice';

import { logout } from '../../store/slices/authSlice';

const ProfileScreen = ({ navigation }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  
  const profile = useSelector(selectUserProfile);
  const impactMetrics = useSelector(selectUserImpactMetrics);
  const isLoading = useSelector(selectUserLoading);
  const error = useSelector(selectUserError);

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [avatar, setAvatar] = useState(null);

  useEffect(() => {
    dispatch(fetchUserProfile());
    dispatch(fetchUserImpactMetrics());
  }, [dispatch]);

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setEmail(profile.email || '');
      setPhone(profile.phone || '');
      setAddress(profile.address || '');
      setAvatar(profile.avatar || null);
    }
  }, [profile]);

  const handleSaveProfile = () => {
    const userData = {
      name,
      phone,
      address,
      avatar
    };
    
    dispatch(updateUserProfile(userData))
      .unwrap()
      .then(() => {
        setIsEditing(false);
        Alert.alert('Success', 'Profile updated successfully');
      })
      .catch((err) => {
        Alert.alert('Error', err || 'Failed to update profile');
      });
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need camera roll permission to upload images');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: () => dispatch(logout()),
          style: 'destructive',
        },
      ]
    );
  };

  if (isLoading && !profile) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          {!isEditing ? (
            <TouchableOpacity onPress={() => setIsEditing(true)}>
              <MaterialCommunityIcons name="pencil" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => setIsEditing(false)}>
              <MaterialCommunityIcons name="close" size={24} color={theme.colors.error} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.profileHeader}>
          <TouchableOpacity 
            style={styles.avatarContainer}
            onPress={isEditing ? handlePickImage : null}
            disabled={!isEditing}
          >
            {avatar ? (
              <Avatar.Image 
                source={{ uri: avatar }} 
                size={100} 
                style={styles.avatar} 
              />
            ) : (
              <Avatar.Icon 
                icon="account" 
                size={100} 
                style={styles.avatar} 
                color="#fff"
                backgroundColor={theme.colors.primary}
              />
            )}
            {isEditing && (
              <View style={styles.editAvatarIcon}>
                <MaterialCommunityIcons name="camera" size={20} color="#fff" />
              </View>
            )}
          </TouchableOpacity>
          
          <Text style={styles.profileName}>
            {profile?.name || 'User'}
          </Text>
          <Text style={styles.profileType}>
            {profile?.userType === 'business' ? 'Business Account' : 'Consumer Account'}
          </Text>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            
            {isEditing ? (
              <View style={styles.formContainer}>
                <TextInput
                  label="Full Name"
                  value={name}
                  onChangeText={setName}
                  mode="outlined"
                  style={styles.input}
                  left={<TextInput.Icon icon="account" />}
                />
                
                <TextInput
                  label="Email"
                  value={email}
                  disabled={true}
                  mode="outlined"
                  style={styles.input}
                  left={<TextInput.Icon icon="email" />}
                />
                
                <TextInput
                  label="Phone Number"
                  value={phone}
                  onChangeText={setPhone}
                  mode="outlined"
                  style={styles.input}
                  keyboardType="phone-pad"
                  left={<TextInput.Icon icon="phone" />}
                />
                
                <TextInput
                  label="Address"
                  value={address}
                  onChangeText={setAddress}
                  mode="outlined"
                  style={styles.input}
                  left={<TextInput.Icon icon="map-marker" />}
                />
                
                <Button 
                  mode="contained" 
                  onPress={handleSaveProfile}
                  style={styles.saveButton}
                  loading={isLoading}
                  disabled={isLoading}
                >
                  Save Changes
                </Button>
              </View>
            ) : (
              <View style={styles.infoContainer}>
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="account" size={20} color={theme.colors.primary} />
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoLabel}>Full Name</Text>
                    <Text style={styles.infoValue}>{profile?.name || 'Not set'}</Text>
                  </View>
                </View>
                
                <Divider style={styles.divider} />
                
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="email" size={20} color={theme.colors.primary} />
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoLabel}>Email</Text>
                    <Text style={styles.infoValue}>{profile?.email || 'Not set'}</Text>
                  </View>
                </View>
                
                <Divider style={styles.divider} />
                
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="phone" size={20} color={theme.colors.primary} />
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoLabel}>Phone Number</Text>
                    <Text style={styles.infoValue}>{profile?.phone || 'Not set'}</Text>
                  </View>
                </View>
                
                <Divider style={styles.divider} />
                
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="map-marker" size={20} color={theme.colors.primary} />
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoLabel}>Address</Text>
                    <Text style={styles.infoValue}>{profile?.address || 'Not set'}</Text>
                  </View>
                </View>
              </View>
            )}
          </Card.Content>
        </Card>

        {profile?.userType === 'consumer' && impactMetrics && (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Your Impact</Text>
              
              <View style={styles.impactContainer}>
                <View style={styles.impactItem}>
                  <MaterialCommunityIcons name="food-apple" size={32} color={theme.colors.primary} />
                  <Text style={styles.impactValue}>{impactMetrics.foodSaved || 0}</Text>
                  <Text style={styles.impactLabel}>Items Saved</Text>
                </View>
                
                <View style={styles.impactItem}>
                  <MaterialCommunityIcons name="cash" size={32} color={theme.colors.primary} />
                  <Text style={styles.impactValue}>${impactMetrics.moneySaved || 0}</Text>
                  <Text style={styles.impactLabel}>Money Saved</Text>
                </View>
                
                <View style={styles.impactItem}>
                  <MaterialCommunityIcons name="leaf" size={32} color={theme.colors.primary} />
                  <Text style={styles.impactValue}>{impactMetrics.co2Reduced || 0}kg</Text>
                  <Text style={styles.impactLabel}>CO2 Reduced</Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        )}

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Account Settings</Text>
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => navigation.navigate('ChangePassword')}
            >
              <MaterialCommunityIcons name="lock-reset" size={24} color={theme.colors.primary} />
              <Text style={styles.settingText}>Change Password</Text>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#888" />
            </TouchableOpacity>
            
            <Divider style={styles.divider} />
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => navigation.navigate('Notifications')}
            >
              <MaterialCommunityIcons name="bell-outline" size={24} color={theme.colors.primary} />
              <Text style={styles.settingText}>Notification Settings</Text>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#888" />
            </TouchableOpacity>
            
            <Divider style={styles.divider} />
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => navigation.navigate('Help')}
            >
              <MaterialCommunityIcons name="help-circle-outline" size={24} color={theme.colors.primary} />
              <Text style={styles.settingText}>Help & Support</Text>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#888" />
            </TouchableOpacity>
            
            <Divider style={styles.divider} />
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={handleLogout}
            >
              <MaterialCommunityIcons name="logout" size={24} color={theme.colors.error} />
              <Text style={[styles.settingText, { color: theme.colors.error }]}>Logout</Text>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#888" />
            </TouchableOpacity>
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  avatar: {
    backgroundColor: '#ccc',
  },
  editAvatarIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#666',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 8,
  },
  profileType: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  card: {
    marginBottom: 16,
    borderRadius: 10,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  formContainer: {
    marginTop: 10,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  saveButton: {
    marginTop: 10,
    paddingVertical: 8,
  },
  infoContainer: {
    marginTop: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#888',
  },
  infoValue: {
    fontSize: 16,
    marginTop: 2,
  },
  divider: {
    height: 1,
  },
  impactContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  impactItem: {
    alignItems: 'center',
    flex: 1,
    padding: 10,
  },
  impactValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  impactLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  settingText: {
    fontSize: 16,
    marginLeft: 16,
    flex: 1,
  },
});

export default ProfileScreen;
