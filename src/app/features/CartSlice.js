import { createSlice }  from "@reduxjs/toolkit";
import { getCart, addToCart, removeFromCart,updateCartItem } from "./thunks/CartThunk";

const cartSlice = createSlice({
    name:"cart",
    initialState:{
        cartID:'',
        cartItems:[],
        cartTotalPrice:0,
        cartLoadingState:'',
        addState:'',
        removeState:'',
    },
    reducers:{
        ClearCart:(state)=>{
            state.cartItems=[];
            state.cartID='';
            state.cartTotalPrice=0;
            state.cartLoadingState='';
            state.addState='';
            state.removeState='';
            state.updateState='';
        },
        GuestAddToCart:(state,action)=>{
            
            let cartItem = action.payload.cartItem;
            const item = state.cartItems.find(item=>item?.ProductVariantId == cartItem.ProductVariantId);
            if(!item){
                cartItem = {id:state?.cartItems?.length>0?state?.cartItems?.length+1:1,...cartItem}
                state.cartItems.push(cartItem);
                state.cartTotalPrice += action.payload.price;
            }
        },
        GuestUpdateCartItem:(state,action)=>{
            console.log("inside guest update:",action.payload);
            const cartItemId = action.payload.cartItem.id;
            const cartItemQuantity = action.payload.cartItem.quantity;
            state.cartItems = state.cartItems.map(item=>item.id===cartItemId?{...item,quantity:cartItemQuantity}:item)
            state.cartTotalPrice -= action.payload.oldPrice;
            state.cartTotalPrice += action.payload.price;
        },
        GuestRemoveFromCart:(state,action)=>{
            console.log("payload inside remove action",action.payload.cartItem.id);
            
            let cartItemId = action.payload.cartItem.id;
            state.cartItems = state.cartItems.filter(item=>item.id !== cartItemId);
            state.cartTotalPrice -= action.payload.price;
        },
        replaceCart:(state,action)=>{
            state.cartID = action.payload.id;
            state.cartItems = action.payload.cartItems; // be consistent with your API response naming
            state.cartTotalPrice = action.payload.totalPrice;
        }
    },
    extraReducers:(builder)=>{
        builder.addCase(getCart.pending,(state,action)=>{
            state.cartLoadingState ='loading';
        }),
        builder.addCase(getCart.fulfilled,(state,action)=>{
            state.cartLoadingState ='completed';
            console.log("Cart data received:", action.payload);
            state.cartItems = action.payload.CartItems;
            state.cartID = action.payload.id;
            state.cartTotalPrice = action.payload.totalPrice;

        }),
        builder.addCase(getCart.rejected,(state,action)=>{
            state.cartLoadingState ='failed';
        }),
        
        builder.addCase(addToCart.fulfilled,(state,action)=>{
            console.log("Cart item added:", action.payload);
            state.addState ='completed';
            const cartItem = action.payload.cartItem;
            state.cartItems.push(cartItem)
            state.cartTotalPrice += action.payload.price;
        }),
        builder.addCase(addToCart.rejected,(state,action)=>{
            state.addState ='failed';
        }),
        builder.addCase(addToCart.pending,(state,action)=>{
            state.addState ='loading';
        }),

        builder.addCase(updateCartItem.fulfilled,(state,action)=>{
            console.log("Cart item updated:", action.payload);
            state.updateState ='completed';
            const cartItemId = action.payload.cartItemId;
            const cartItemQuantity = action.payload.quantity;
            state.cartItems.map(item=>item.id===cartItemId?{...item,quantity:cartItemQuantity}:item)
            state.cartTotalPrice += action.payload.price;
        }),
        builder.addCase(updateCartItem.rejected,(state,action)=>{
            state.updateState ='failed';
        }),
        builder.addCase(updateCartItem.pending,(state,action)=>{
            state.updateState ='loading';
        }),

        builder.addCase(removeFromCart.fulfilled,(state,action)=>{
            console.log("Cart item removed:", action.payload);
            console.log("Cart item removed:", action.payload);
            state.removeState ='completed';
            let cartItemId = action.payload.cartItemId;
            state.cartItems.filter(item=>item.id !== cartItemId);
            state.cartTotalPrice -= action.payload.price;
        }),
        builder.addCase(removeFromCart.rejected,(state,action)=>{
            state.addState ='failed';
        }),
        builder.addCase(removeFromCart.pending,(state,action)=>{
            state.addState ='loading';
        })


    }
});
export default cartSlice.reducer;
export  const {ClearCart,replaceCart,GuestAddToCart,GuestUpdateCartItem,GuestRemoveFromCart} = cartSlice.actions ;