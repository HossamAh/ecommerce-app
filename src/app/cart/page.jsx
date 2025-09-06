"use client";
import { useSelector, useDispatch } from "react-redux";
import { SelectCart, SelectUser } from "../selectors";
import useLocalStorage from "../utils/LocalStorage";
import Link from "next/link";
import { getCart } from "../features/thunks/CartThunk";
import { useEffect, useState } from "react";
import CartItemsList from "../components/cartComponents/CartItemsList";
import GuestCartItemsList from "../components/cartComponents/GuestCartItemsList";
import OrderSummary from "../components/cartComponents/OrderSummary";

export default function Cart() {
  const dispatch = useDispatch();
  const cart = useSelector(SelectCart);
  const user = useSelector(SelectUser);
  const [accessToken] = useLocalStorage("accessToken", "");
  const [removedItems, setRemovedItems] = useState(new Set());
  const shippingFee = 50;

  // Fetch cart data for authenticated users
  useEffect(() => {
    if (accessToken) {
      dispatch(getCart(accessToken));
    }
  }, [dispatch, accessToken]);

  // Handle cart items and calculations based on auth status
  const cartItems = user.user
    ? cart?.cartItems?.filter(
        (item) => item?.ProductVariant && !removedItems.has(item.id)
      ) || []
    : cart?.cartItems || [];

  const totalPrice = cartItems.reduce(
    (total, item) =>
      total + (item.ProductVariant?.price || 0) * (item.quantity || 0),
    0
  );

  const handleItemRemoval = (itemId) => {
    setRemovedItems((prev) => new Set([...prev, itemId]));
  };

  // Render empty cart message if no items
  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Shopping Cart</h1>
        <p>Your cart is empty</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Shopping Cart</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[1.5fr_1fr]">
        {user.user ? (
          <CartItemsList
            cartItems={cartItems}
            cart={cart}
            accessToken={accessToken}
            handleItemRemoval={handleItemRemoval}
            dispatch={dispatch}
            getCart={getCart}
          />
        ) : (
          <GuestCartItemsList cartItems={cartItems} cart={cart} />
        )}
        <OrderSummary totalPrice={totalPrice} shippingFee={shippingFee} />
      </div>
    </div>
  );
}
