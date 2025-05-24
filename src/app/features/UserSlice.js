import { getUser } from "./thunks/UserThunk";

const { createSlice } = require("@reduxjs/toolkit");

 const userSlice = createSlice({
    name:"user",
    initialState:{
        user:NaN
        ,loadingStatus:''
    },
    reducers:{
        
    },
    extraReducers:(builder)=>{
        builder.addCase(getUser.pending,(state,action)=>{
            state.loadingStatus = "loading";
        }), 
        builder.addCase(getUser.fulfilled,(state,action)=>{
            state.loadingStatus = "completed";
            state.user = action.payload;
        }), 
        builder.addCase(getUser.rejected,(state,action)=>{
            state.loadingStatus = "failed";
        })
    }
});
export default userSlice.reducer;