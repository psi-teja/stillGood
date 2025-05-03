import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Text, Button, useTheme, ActivityIndicator, Divider, Chip, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';

import { fetchProductById, selectCurrentProduct, selectProductsLoading } from '../../store/slices/productsSlice';

const { width } = Dimensions.get('window');

const ProductDetailsScreen = ({ route, navigation }) => {
  const { productId } = route.params;
  const theme = useTheme();
  const dispatch = useDispatch();
  const product = useSelector(selectCurrentProduct);
  const isLoading = useSelector(selectProductsLoading);
  
  const [quantity, setQuantity] = useState(1);
  const [selectedPickupTime, setSelectedPickupTime] = useState(null);
  const [availablePickupTimes, setAvailablePickupTimes] = useState([]);

  useEffect(() => {
    dispatch(fetchProductById(productId));
  }, [dispatch, productId]);

  useEffect(() => {
    if (product) {
      // Generate pickup time slots
      const startTime = moment(product.pickupTimeStart);
      const endTime = moment(product.pickupTimeEnd);
      const slots = [];
      
      let current = moment(startTime);
      while (current.isBefore(endTime)) {
        slots.push(current.format('h:mm A'));
        current.add(30, 'minutes');
      }
      
      setAvailablePickupTimes(slots);
      if (slots.length > 0) {
        setSelectedPickupTime(slots[0]);
      }
    }
  }, [product]);

  const incrementQuantity = () => {
    if (product && quantity < product.quantityAvailable) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleCheckout = () => {
    navigation.navigate('Checkout', {
      product,
      quantity,
      pickupTime: selectedPickupTime,
      totalPrice: (product.discountedPrice * quantity).toFixed(2)
    });
  };

  if (isLoading || !product) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading product details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const discountPercentage = Math.round(
    ((product.originalPrice - product.discountedPrice) / product.originalPrice) * 100
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <View style={styles.header}>
          <IconButton
            icon="arrow-left"
            size={24}
            onPress={() => navigation.goBack()}
          />
          <IconButton
            icon="map-marker"
            size={24}
            onPress={() => navigation.navigate('Map', { businessId: product.business._id })}
          />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {product.images && product.images.length > 0 ? (
            <Image
              source={{ uri: product.images[0] }}
              style={styles.productImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.noImageContainer}>
              <MaterialCommunityIcons name="image-off" size={64} color="#CCCCCC" />
              <Text style={styles.noImageText}>No image available</Text>
            </View>
          )}

          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{discountPercentage}% OFF</Text>
          </View>

          <View style={styles.contentContainer}>
            <Text style={styles.businessName}>{product.business.name}</Text>
            <Text style={styles.productName}>{product.name}</Text>
            
            <View style={styles.priceContainer}>
              <Text style={styles.discountedPrice}>${product.discountedPrice.toFixed(2)}</Text>
              <Text style={styles.originalPrice}>${product.originalPrice.toFixed(2)}</Text>
            </View>

            <View style={styles.infoContainer}>
              <View style={styles.infoItem}>
                <MaterialCommunityIcons name="calendar" size={20} color="#666666" />
                <Text style={styles.infoText}>
                  Expires: {moment(product.expiryDate).format('MMM D, YYYY')}
                </Text>
              </View>
              
              <View style={styles.infoItem}>
                <MaterialCommunityIcons name="clock-outline" size={20} color="#666666" />
                <Text style={styles.infoText}>
                  Pickup: {moment(product.pickupTimeStart).format('h:mm A')} - {moment(product.pickupTimeEnd).format('h:mm A')}
                </Text>
              </View>
              
              <View style={styles.infoItem}>
                <MaterialCommunityIcons name="package-variant" size={20} color="#666666" />
                <Text style={styles.infoText}>
                  Available: {product.quantityAvailable} left
                </Text>
              </View>
            </View>

            <Divider style={styles.divider} />

            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{product.description}</Text>

            <Divider style={styles.divider} />

            <Text style={styles.sectionTitle}>Category</Text>
            <View style={styles.tagsContainer}>
              <Chip style={styles.tag}>{product.category}</Chip>
              
              {product.tags && product.tags.map((tag, index) => (
                <Chip key={index} style={styles.tag}>{tag}</Chip>
              ))}
            </View>

            {(product.allergens && product.allergens.length > 0) && (
              <>
                <Divider style={styles.divider} />
                <Text style={styles.sectionTitle}>Allergens</Text>
                <View style={styles.tagsContainer}>
                  {product.allergens.map((allergen, index) => (
                    <Chip key={index} style={styles.allergenTag}>{allergen}</Chip>
                  ))}
                </View>
              </>
            )}

            <Divider style={styles.divider} />

            <Text style={styles.sectionTitle}>Select Quantity</Text>
            <View style={styles.quantitySelector}>
              <IconButton
                icon="minus"
                size={20}
                style={[styles.quantityButton, { opacity: quantity === 1 ? 0.5 : 1 }]}
                onPress={decrementQuantity}
                disabled={quantity === 1}
              />
              <Text style={styles.quantityText}>{quantity}</Text>
              <IconButton
                icon="plus"
                size={20}
                style={[styles.quantityButton, { opacity: quantity === product.quantityAvailable ? 0.5 : 1 }]}
                onPress={incrementQuantity}
                disabled={quantity === product.quantityAvailable}
              />
            </View>

            <Divider style={styles.divider} />

            <Text style={styles.sectionTitle}>Select Pickup Time</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.pickupTimesContainer}
            >
              {availablePickupTimes.map((time, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.timeSlot,
                    selectedPickupTime === time && { backgroundColor: theme.colors.primary }
                  ]}
                  onPress={() => setSelectedPickupTime(time)}
                >
                  <Text
                    style={[
                      styles.timeSlotText,
                      selectedPickupTime === time && { color: '#FFFFFF' }
                    ]}
                  >
                    {time}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalPrice}>${(product.discountedPrice * quantity).toFixed(2)}</Text>
            </View>

            <Button
              mode="contained"
              onPress={handleCheckout}
              style={[styles.checkoutButton, { backgroundColor: theme.colors.primary }]}
              labelStyle={styles.checkoutButtonLabel}
              disabled={product.isSoldOut || product.quantityAvailable === 0}
            >
              {product.isSoldOut || product.quantityAvailable === 0
                ? 'Sold Out'
                : 'Proceed to Checkout'}
            </Button>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
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
  productImage: {
    width: width,
    height: width * 0.75,
  },
  noImageContainer: {
    width: width,
    height: width * 0.75,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    marginTop: 8,
    color: '#999999',
  },
  discountBadge: {
    position: 'absolute',
    top: 60,
    right: 16,
    backgroundColor: '#FF5722',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  discountText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  contentContainer: {
    padding: 16,
  },
  businessName: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  discountedPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginRight: 12,
  },
  originalPrice: {
    fontSize: 16,
    color: '#999999',
    textDecorationLine: 'line-through',
  },
  infoContainer: {
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 8,
  },
  divider: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333333',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    marginRight: 8,
    marginBottom: 8,
  },
  allergenTag: {
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#FFEBEE',
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButton: {
    backgroundColor: '#F5F5F5',
  },
  quantityText: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingHorizontal: 16,
  },
  pickupTimesContainer: {
    marginBottom: 16,
  },
  timeSlot: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    marginRight: 8,
  },
  timeSlotText: {
    fontSize: 14,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  checkoutButton: {
    paddingVertical: 8,
    marginBottom: 16,
  },
  checkoutButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingVertical: 4,
  },
});

export default ProductDetailsScreen;
