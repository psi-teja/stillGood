import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../config/api';

// Async thunks
export const fetchUserProfile = createAsyncThunk(
  'user/fetchUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/users/profile');
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch user profile'
      );
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'user/updateUserProfile',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.put('/users/profile', userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update user profile'
      );
    }
  }
);

export const fetchUserImpactMetrics = createAsyncThunk(
  'user/fetchUserImpactMetrics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/users/impact');
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch impact metrics'
      );
    }
  }
);

export const fetchUserFavorites = createAsyncThunk(
  'user/fetchUserFavorites',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/users/favorites');
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch favorites'
      );
    }
  }
);

export const addFavorite = createAsyncThunk(
  'user/addFavorite',
  async (businessId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/users/favorites/${businessId}`);
      return { ...response.data, businessId };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to add favorite'
      );
    }
  }
);

export const removeFavorite = createAsyncThunk(
  'user/removeFavorite',
  async (businessId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/users/favorites/${businessId}`);
      return { ...response.data, businessId };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to remove favorite'
      );
    }
  }
);

// Initial state
const initialState = {
  profile: null,
  favorites: [],
  impactMetrics: null,
  isLoading: false,
  error: null,
};

// Slice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUserError: (state) => {
      state.error = null;
    },
    clearUserData: (state) => {
      state.profile = null;
      state.favorites = [];
      state.impactMetrics = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch user profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload.user;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Update user profile
      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload.user;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch user impact metrics
      .addCase(fetchUserImpactMetrics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserImpactMetrics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.impactMetrics = action.payload.impactMetrics;
      })
      .addCase(fetchUserImpactMetrics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch user favorites
      .addCase(fetchUserFavorites.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserFavorites.fulfilled, (state, action) => {
        state.isLoading = false;
        state.favorites = action.payload.favorites;
      })
      .addCase(fetchUserFavorites.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Add favorite
      .addCase(addFavorite.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addFavorite.fulfilled, (state, action) => {
        state.isLoading = false;
        // In a real app, we would refetch the favorites here
        // For now, we'll just add the ID to the favorites array
        if (state.profile && state.profile.favorites) {
          state.profile.favorites.push(action.payload.businessId);
        }
      })
      .addCase(addFavorite.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Remove favorite
      .addCase(removeFavorite.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeFavorite.fulfilled, (state, action) => {
        state.isLoading = false;
        // In a real app, we would refetch the favorites here
        // For now, we'll just remove the ID from the favorites array
        if (state.profile && state.profile.favorites) {
          state.profile.favorites = state.profile.favorites.filter(
            id => id !== action.payload.businessId
          );
        }
      })
      .addCase(removeFavorite.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearUserError, clearUserData } = userSlice.actions;

export default userSlice.reducer;

// Selectors
export const selectUserProfile = (state) => state.user.profile;
export const selectUserFavorites = (state) => state.user.favorites;
export const selectUserImpactMetrics = (state) => state.user.impactMetrics;
export const selectUserLoading = (state) => state.user.isLoading;
export const selectUserError = (state) => state.user.error;
