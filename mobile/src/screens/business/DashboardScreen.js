import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card, Button, useTheme, ActivityIndicator, Avatar, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

import { selectCurrentUser } from '../../store/slices/authSlice';

const screenWidth = Dimensions.get('window').width;

const DashboardScreen = ({ navigation }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const currentUser = useSelector(selectCurrentUser);
  
  const [isLoading, setIsLoading] = useState(true);
  const [businessData, setBusinessData] = useState(null);
  const [salesData, setSalesData] = useState(null);
  const [activeProducts, setActiveProducts] = useState(0);
  const [pendingOrders, setPendingOrders] = useState(0);

  // Mock data for demonstration
  useEffect(() => {
    // In a real app, this would fetch data from the API
    setTimeout(() => {
      setBusinessData({
        name: 'Green Grocers',
        logo: 'https://via.placeholder.com/150',
        impactMetrics: {
          foodSaved: 120,
          co2Reduced: 240,
          ordersCompleted: 45
        }
      });
      
      setSalesData({
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [
          {
            data: [20, 45, 28, 80, 99, 43, 50],
            color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
            strokeWidth: 2
          }
        ],
      });
      
      setActiveProducts(12);
      setPendingOrders(3);
      setIsLoading(false);
    }, 1500);
  }, []);

  const chartConfig = {
    backgroundGradientFrom: '#FFFFFF',
    backgroundGradientTo: '#FFFFFF',
    color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
    strokeWidth: 2,
    decimalPlaces: 0,
    style: {
      borderRadius: 16
    }
  };

  const pieChartData = [
    {
      name: 'Bakery',
      population: 25,
      color: '#FF5722',
      legendFontColor: '#7F7F7F',
      legendFontSize: 12
    },
    {
      name: 'Fruits',
      population: 35,
      color: '#4CAF50',
      legendFontColor: '#7F7F7F',
      legendFontSize: 12
    },
    {
      name: 'Dairy',
      population: 15,
      color: '#2196F3',
      legendFontColor: '#7F7F7F',
      legendFontSize: 12
    },
    {
      name: 'Vegetables',
      population: 25,
      color: '#FFC107',
      legendFontColor: '#7F7F7F',
      legendFontSize: 12
    }
  ];

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Avatar.Image 
              size={60} 
              source={{ uri: businessData.logo }} 
              style={styles.avatar}
            />
            <View style={styles.headerText}>
              <Text style={styles.welcomeText}>Welcome back,</Text>
              <Text style={styles.businessName}>{businessData.name}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
            <MaterialCommunityIcons name="cog" size={24} color="#666666" />
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <Card style={styles.statsCard}>
            <Card.Content style={styles.statsCardContent}>
              <MaterialCommunityIcons name="food-apple" size={32} color={theme.colors.primary} />
              <View style={styles.statsTextContainer}>
                <Text style={styles.statsNumber}>{activeProducts}</Text>
                <Text style={styles.statsLabel}>Active Products</Text>
              </View>
            </Card.Content>
          </Card>
          
          <Card style={styles.statsCard}>
            <Card.Content style={styles.statsCardContent}>
              <MaterialCommunityIcons name="receipt" size={32} color={theme.colors.accent} />
              <View style={styles.statsTextContainer}>
                <Text style={styles.statsNumber}>{pendingOrders}</Text>
                <Text style={styles.statsLabel}>Pending Orders</Text>
              </View>
            </Card.Content>
          </Card>
        </View>

        <Card style={styles.impactCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Your Impact</Text>
            <View style={styles.impactStatsContainer}>
              <View style={styles.impactStat}>
                <MaterialCommunityIcons name="food" size={32} color={theme.colors.primary} />
                <Text style={styles.impactNumber}>{businessData.impactMetrics.foodSaved} kg</Text>
                <Text style={styles.impactLabel}>Food Saved</Text>
              </View>
              
              <View style={styles.impactStat}>
                <MaterialCommunityIcons name="molecule-co2" size={32} color="#2196F3" />
                <Text style={styles.impactNumber}>{businessData.impactMetrics.co2Reduced} kg</Text>
                <Text style={styles.impactLabel}>CO₂ Reduced</Text>
              </View>
              
              <View style={styles.impactStat}>
                <MaterialCommunityIcons name="check-circle" size={32} color="#FFC107" />
                <Text style={styles.impactNumber}>{businessData.impactMetrics.ordersCompleted}</Text>
                <Text style={styles.impactLabel}>Orders Completed</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.chartCard}>
          <Card.Content>
            <View style={styles.chartHeader}>
              <Text style={styles.sectionTitle}>Weekly Sales</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Analytics')}>
                <Text style={[styles.viewAllText, { color: theme.colors.primary }]}>View All</Text>
              </TouchableOpacity>
            </View>
            <LineChart
              data={salesData}
              width={screenWidth - 64}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          </Card.Content>
        </Card>

        <Card style={styles.chartCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Product Categories</Text>
            <PieChart
              data={pieChartData}
              width={screenWidth - 64}
              height={220}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              style={styles.chart}
            />
          </Card.Content>
        </Card>

        <View style={styles.actionButtonsContainer}>
          <Button
            mode="contained"
            icon="plus"
            onPress={() => navigation.navigate('AddProduct')}
            style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
            labelStyle={styles.actionButtonLabel}
          >
            Add New Product
          </Button>
          
          <Button
            mode="outlined"
            icon="view-list"
            onPress={() => navigation.navigate('Products')}
            style={styles.actionButton}
            labelStyle={styles.actionButtonLabel}
          >
            Manage Products
          </Button>
        </View>
      </ScrollView>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    marginRight: 16,
  },
  headerText: {
    justifyContent: 'center',
  },
  welcomeText: {
    fontSize: 14,
    color: '#666666',
  },
  businessName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statsCard: {
    width: '48%',
  },
  statsCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  statsTextContainer: {
    marginLeft: 12,
  },
  statsNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statsLabel: {
    fontSize: 12,
    color: '#666666',
  },
  impactCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  impactStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  impactStat: {
    alignItems: 'center',
    flex: 1,
  },
  impactNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
  },
  impactLabel: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
  },
  chartCard: {
    marginBottom: 16,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  actionButtonsContainer: {
    marginBottom: 24,
  },
  actionButton: {
    marginBottom: 12,
    paddingVertical: 8,
  },
  actionButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DashboardScreen;
