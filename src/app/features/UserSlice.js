import { getUser, UserLogout, UserLogin } from "./thunks/UserThunk";

const { createSlice } = require("@reduxjs/toolkit");

const userSlice = createSlice({
    name: "user",
    initialState: {
        user: null,
        loadingStatus: '',
        accessToken:''
    },
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(getUser.pending, (state, action) => {
            state.loadingStatus = "loading";
        }),
        builder.addCase(getUser.fulfilled, (state, action) => {
            state.loadingStatus = "completed";
            console.log(action.payload);
            state.user = action.payload;
        }),
        builder.addCase(getUser.rejected, (state, action) => {
            state.loadingStatus = "failed";
        }),
        builder.addCase(UserLogout.pending, (state, action) => {
            state.loadingStatus = "loading";
        }),
        builder.addCase(UserLogout.fulfilled, (state, action) => {
            state.loadingStatus = "completed";
            state.user = null;
        }),
        builder.addCase(UserLogout.rejected, (state, action) => {
            state.loadingStatus = "failed";
        }),
        builder.addCase(UserLogin.pending, (state, action) => {
            state.loadingStatus = "loading";
        }),
        builder.addCase(UserLogin.fulfilled, (state, action) => {
            state.loadingStatus = "completed";
            // Store the access token or other login response data if needed
            state.accessToken = action.payload.accessToken;
        }),
        builder.addCase(UserLogin.rejected, (state, action) => {
            state.loadingStatus = "failed";
        })
    }
});

export default userSlice.reducer;