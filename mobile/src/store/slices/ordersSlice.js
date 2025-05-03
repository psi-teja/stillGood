import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../config/api';

// Async thunks
export const fetchConsumerOrders = createAsyncThunk(
  'orders/fetchConsumerOrders',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/orders/consumer', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch orders'
      );
    }
  }
);

export const fetchBusinessOrders = createAsyncThunk(
  'orders/fetchBusinessOrders',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/orders/business', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch orders'
      );
    }
  }
);

export const fetchOrderById = createAsyncThunk(
  'orders/fetchOrderById',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch order'
      );
    }
  }
);

export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await api.post('/orders', orderData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create order'
      );
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  'orders/updateOrderStatus',
  async ({ orderId, status }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/orders/${orderId}/status`, { status });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update order status'
      );
    }
  }
);

export const cancelOrder = createAsyncThunk(
  'orders/cancelOrder',
  async ({ orderId, reason }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/orders/${orderId}/cancel`, { reason });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to cancel order'
      );
    }
  }
);

export const confirmPickup = createAsyncThunk(
  'orders/confirmPickup',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/orders/${orderId}/pickup`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to confirm pickup'
      );
    }
  }
);

export const addOrderReview = createAsyncThunk(
  'orders/addOrderReview',
  async ({ orderId, rating, comment }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/orders/${orderId}/review`, {
        rating,
        comment,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to add review'
      );
    }
  }
);

// Initial state
const initialState = {
  consumerOrders: [],
  businessOrders: [],
  currentOrder: null,
  isLoading: false,
  error: null,
};

// Slice
const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearOrdersError: (state) => {
      state.error = null;
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch consumer orders
      .addCase(fetchConsumerOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchConsumerOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.consumerOrders = action.payload.orders;
      })
      .addCase(fetchConsumerOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch business orders
      .addCase(fetchBusinessOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBusinessOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.businessOrders = action.payload.orders;
      })
      .addCase(fetchBusinessOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch order by ID
      .addCase(fetchOrderById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentOrder = action.payload.order;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Create order
      .addCase(createOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentOrder = action.payload.order;
        state.consumerOrders.unshift(action.payload.order);
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Update order status
      .addCase(updateOrderStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentOrder = action.payload.order;
        
        // Update in business orders list
        const index = state.businessOrders.findIndex(
          (order) => order._id === action.payload.order._id
        );
        if (index !== -1) {
          state.businessOrders[index] = action.payload.order;
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Cancel order
      .addCase(cancelOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentOrder = action.payload.order;
        
        // Update in consumer orders list
        const index = state.consumerOrders.findIndex(
          (order) => order._id === action.payload.order._id
        );
        if (index !== -1) {
          state.consumerOrders[index] = action.payload.order;
        }
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Confirm pickup
      .addCase(confirmPickup.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(confirmPickup.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentOrder = action.payload.order;
        
        // Update in consumer orders list
        const consumerIndex = state.consumerOrders.findIndex(
          (order) => order._id === action.payload.order._id
        );
        if (consumerIndex !== -1) {
          state.consumerOrders[consumerIndex] = action.payload.order;
        }
        
        // Update in business orders list
        const businessIndex = state.businessOrders.findIndex(
          (order) => order._id === action.payload.order._id
        );
        if (businessIndex !== -1) {
          state.businessOrders[businessIndex] = action.payload.order;
        }
      })
      .addCase(confirmPickup.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Add order review
      .addCase(addOrderReview.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addOrderReview.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentOrder = action.payload.order;
        
        // Update in consumer orders list
        const index = state.consumerOrders.findIndex(
          (order) => order._id === action.payload.order._id
        );
        if (index !== -1) {
          state.consumerOrders[index] = action.payload.order;
        }
      })
      .addCase(addOrderReview.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearOrdersError, clearCurrentOrder } = ordersSlice.actions;

export default ordersSlice.reducer;

// Selectors
export const selectConsumerOrders = (state) => state.orders.consumerOrders;
export const selectBusinessOrders = (state) => state.orders.businessOrders;
export const selectCurrentOrder = (state) => state.orders.currentOrder;
export const selectOrdersLoading = (state) => state.orders.isLoading;
export const selectOrdersError = (state) => state.orders.error;
