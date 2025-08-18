"use client";
import { useSelector, useDispatch } from "react-redux";
import { SelectCart } from "../selectors";
import useLocalStorage from "../utils/LocalStorage";
import Link from "next/link";
import { getCart } from "../features/thunks/CartThunk";
import { useEffect, useState } from "react";
import CartItemsList from "../components/cartComponents/CartItemsList";
import OrderSummary from "../components/cartComponents/OrderSummary";

export default function Cart() {
  const dispatch = useDispatch();
  const cart = useSelector(SelectCart);
  const [accessToken] = useLocalStorage("accessToken", "");
  const [removedItems, setRemovedItems] = useState(new Set());
  const shippingFee = 50;
  // Refresh cart when mounted
  useEffect(() => {
    if (accessToken) {
      dispatch(getCart(accessToken));
    }
  }, [dispatch, accessToken]);

  if (cart?.loadingState === "loading") {
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  const cartItems = cart?.cartItems?.filter(item => 
    item?.ProductVariant && !removedItems.has(item.id)
  ) || [];
  
  const totalPrice = cartItems.reduce((total, item) => 
    total + (item.ProductVariant?.price || 0) * (item.quantity || 0), 0
  );

  const handleItemRemoval = (itemId) => {
    setRemovedItems(prev => new Set([...prev, itemId]));
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Shopping Cart</h1>
      
      {cartItems.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[1.5fr_1fr]">
          <CartItemsList 
            cartItems={cartItems} 
            cart={cart} 
            accessToken={accessToken} 
            handleItemRemoval={handleItemRemoval} 
            dispatch={dispatch} 
            getCart={getCart} 
          />
          <OrderSummary 
            totalPrice={totalPrice} 
            shippingFee={shippingFee} 
          />
        </div>
      ) : (
        <p>Your cart is empty</p>
      )}
    </div>
  );
}
