import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import companyService from "../../services/companyService";

export const registerCompany = createAsyncThunk(
  "company/register",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await companyService.register(payload);
      return res.company || res;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || err.message || "Registration failed"
      );
    }
  }
);

export const fetchCompanyProfile = createAsyncThunk(
  "company/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const res = await companyService.getProfile();
      return res.company || res;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || err.message || "Fetch failed"
      );
    }
  }
);

export const updateCompany = createAsyncThunk(
  "company/update",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await companyService.updateProfile(payload);
      return res.company || res;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || err.message || "Update failed"
      );
    }
  }
);

const companySlice = createSlice({
  name: "company",
  initialState: {
    profile: null,
    loading: false,
    error: null,
  },
  reducers: {
    setCompany(state, action) {
      state.profile = action.payload;
    },
    clearCompany(state) {
      state.profile = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerCompany.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerCompany.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(registerCompany.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchCompanyProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompanyProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchCompanyProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateCompany.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCompany.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(updateCompany.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setCompany, clearCompany } = companySlice.actions;
export default companySlice.reducer;

