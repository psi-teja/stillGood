import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../config/api';

// Async thunks
export const fetchBusinessProfile = createAsyncThunk(
  'business/fetchBusinessProfile',
  async (businessId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/businesses/${businessId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch business profile'
      );
    }
  }
);

export const createBusinessProfile = createAsyncThunk(
  'business/createBusinessProfile',
  async (businessData, { rejectWithValue }) => {
    try {
      const response = await api.post('/businesses', businessData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create business profile'
      );
    }
  }
);

export const updateBusinessProfile = createAsyncThunk(
  'business/updateBusinessProfile',
  async ({ businessId, businessData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/businesses/${businessId}`, businessData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update business profile'
      );
    }
  }
);

export const fetchBusinessAnalytics = createAsyncThunk(
  'business/fetchBusinessAnalytics',
  async (businessId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/businesses/${businessId}/analytics`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch business analytics'
      );
    }
  }
);

export const fetchBusinessReviews = createAsyncThunk(
  'business/fetchBusinessReviews',
  async (businessId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/businesses/${businessId}/reviews`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch business reviews'
      );
    }
  }
);

export const fetchAllBusinesses = createAsyncThunk(
  'business/fetchAllBusinesses',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/businesses', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch businesses'
      );
    }
  }
);

// Initial state
const initialState = {
  currentBusiness: null,
  businesses: [],
  analytics: null,
  reviews: [],
  isLoading: false,
  error: null,
};

// Slice
const businessSlice = createSlice({
  name: 'business',
  initialState,
  reducers: {
    clearBusinessError: (state) => {
      state.error = null;
    },
    clearBusinessData: (state) => {
      state.currentBusiness = null;
      state.analytics = null;
      state.reviews = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch business profile
      .addCase(fetchBusinessProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBusinessProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentBusiness = action.payload.business;
      })
      .addCase(fetchBusinessProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Create business profile
      .addCase(createBusinessProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createBusinessProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentBusiness = action.payload.business;
      })
      .addCase(createBusinessProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Update business profile
      .addCase(updateBusinessProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateBusinessProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentBusiness = action.payload.business;
      })
      .addCase(updateBusinessProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch business analytics
      .addCase(fetchBusinessAnalytics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBusinessAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.analytics = action.payload.analytics;
      })
      .addCase(fetchBusinessAnalytics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch business reviews
      .addCase(fetchBusinessReviews.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBusinessReviews.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reviews = action.payload.reviews;
      })
      .addCase(fetchBusinessReviews.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch all businesses
      .addCase(fetchAllBusinesses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllBusinesses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.businesses = action.payload.businesses;
      })
      .addCase(fetchAllBusinesses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearBusinessError, clearBusinessData } = businessSlice.actions;

export default businessSlice.reducer;

// Selectors
export const selectCurrentBusiness = (state) => state.business.currentBusiness;
export const selectBusinesses = (state) => state.business.businesses;
export const selectBusinessAnalytics = (state) => state.business.analytics;
export const selectBusinessReviews = (state) => state.business.reviews;
export const selectBusinessLoading = (state) => state.business.isLoading;
export const selectBusinessError = (state) => state.business.error;
