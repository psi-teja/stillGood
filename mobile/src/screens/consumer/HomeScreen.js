import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, FlatList, TouchableOpacity, Image } from 'react-native';
import { Text, Card, Button, Searchbar, Chip, useTheme, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import * as Location from 'expo-location';

import { fetchNearbyProducts, selectNearbyProducts, selectProductsLoading } from '../../store/slices/productsSlice';
import { PRODUCT_CATEGORIES } from '../../config/constants';

const HomeScreen = ({ navigation }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const nearbyProducts = useSelector(selectNearbyProducts);
  const isLoading = useSelector(selectProductsLoading);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLocationError('Permission to access location was denied');
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        setLocation(location);
        
        // Fetch nearby products based on current location
        dispatch(fetchNearbyProducts({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          radius: 10 // 10km radius
        }));
      } catch (error) {
        setLocationError('Could not get your location');
        console.error(error);
      }
    })();
  }, [dispatch]);

  const handleSearch = () => {
    if (location) {
      dispatch(fetchNearbyProducts({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        radius: 10,
        search: searchQuery,
        category: selectedCategory
      }));
    }
  };

  const handleCategorySelect = (category) => {
    if (selectedCategory === category) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(category);
    }
  };

  const renderProductItem = ({ item }) => {
    const discountPercentage = Math.round(((item.originalPrice - item.discountedPrice) / item.originalPrice) * 100);
    
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('ProductDetails', { productId: item._id })}
        style={styles.productCard}
      >
        <Card>
          <Card.Cover 
            source={{ uri: item.images && item.images.length > 0 
              ? item.images[0] 
              : 'https://via.placeholder.com/300x200?text=No+Image' 
            }} 
            style={styles.productImage}
          />
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{discountPercentage}% OFF</Text>
          </View>
          <Card.Content style={styles.cardContent}>
            <Text style={styles.businessName}>{item.business.name}</Text>
            <Text style={styles.productName}>{item.name}</Text>
            <View style={styles.priceContainer}>
              <Text style={styles.discountedPrice}>${item.discountedPrice.toFixed(2)}</Text>
              <Text style={styles.originalPrice}>${item.originalPrice.toFixed(2)}</Text>
            </View>
            <View style={styles.productFooter}>
              <Text style={styles.quantityText}>
                {item.quantityAvailable} left • Expires {new Date(item.expiryDate).toLocaleDateString()}
              </Text>
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>FoodSaver</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Map')}>
            <MaterialCommunityIcons name="map-marker" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

        <Searchbar
          placeholder="Search for food..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          onSubmitEditing={handleSearch}
          style={styles.searchBar}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {PRODUCT_CATEGORIES.map((category) => (
            <Chip
              key={category}
              selected={selectedCategory === category}
              onPress={() => handleCategorySelect(category)}
              style={[
                styles.categoryChip,
                selectedCategory === category && { backgroundColor: theme.colors.primary }
              ]}
              textStyle={[
                styles.categoryChipText,
                selectedCategory === category && { color: '#FFFFFF' }
              ]}
            >
              {category}
            </Chip>
          ))}
        </ScrollView>

        {locationError ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{locationError}</Text>
            <Button 
              mode="contained" 
              onPress={() => navigation.navigate('Search')}
              style={styles.searchButton}
            >
              Search Without Location
            </Button>
          </View>
        ) : isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Finding deals near you...</Text>
          </View>
        ) : nearbyProducts && nearbyProducts.length > 0 ? (
          <FlatList
            data={nearbyProducts}
            renderItem={renderProductItem}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.productsList}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="food-off" size={64} color="#CCCCCC" />
            <Text style={styles.emptyText}>No deals found nearby</Text>
            <Text style={styles.emptySubtext}>Try changing your search or check back later</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  searchBar: {
    marginBottom: 16,
    elevation: 2,
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  categoriesContent: {
    paddingRight: 8,
  },
  categoryChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  categoryChipText: {
    fontSize: 12,
  },
  productsList: {
    paddingBottom: 16,
  },
  productCard: {
    marginBottom: 16,
  },
  productImage: {
    height: 150,
  },
  discountBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#FF5722',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  discountText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  cardContent: {
    paddingVertical: 12,
  },
  businessName: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  discountedPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 14,
    color: '#999999',
    textDecorationLine: 'line-through',
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 12,
    color: '#666666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#D32F2F',
    textAlign: 'center',
    marginBottom: 16,
  },
  searchButton: {
    marginTop: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default HomeScreen;
