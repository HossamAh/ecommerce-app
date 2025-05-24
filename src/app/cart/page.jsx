"use client";
import { useSelector, useDispatch } from "react-redux";
import { SelectCart } from "../selectors";
import CartActions from "../components/cartComponents/CartActions";
import useLocalStorage from "../utils/LocalStorage";
import Link from "next/link";
import { getCart } from "../features/thunks/CartThunk";
import { useEffect, useState } from "react";
import { Truck, ArrowRight } from "lucide-react";
import {Button} from '../components/ui/button'

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
          <div className="grid grid-cols-1 gap-4">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="border border-gray-300 p-4 rounded-lg shadow grid grid-cols-1 items-center gap-4"
              >
                <div className="flex justify-between gap-4">
                  <Link href={`/products/${item.ProductVariant.ProductId}`} className="flex-shrink-0" >
                    {item.ProductVariant?.Product?.main_image_url && (
                      <img
                        src={item.ProductVariant?.Product?.main_image_url}
                        alt={item.ProductVariant.name}
                        className="w-24 h-24 object-cover rounded"
                      />
                    )}
                  </Link>
                  <div className="flex-grow">
                    <Link href={`/products/${item.ProductVariant.ProductId}`}>
                      <h2 className="text-xl font-semibold">{item.ProductVariant.Product.name}</h2>
                    </Link>
                    <p className="text-green-600 font-bold">
                      ${(item.ProductVariant.price).toFixed(2)}
                    </p>
                    <p className="text-gray-600">Quantity: {item.quantity}</p>
                    <p className="text-gray-600">Color: {item.ProductVariant.Color.name}</p>
                    <p className="text-gray-600">Size: {item.ProductVariant.Size.name}</p>
                    
                  </div>
                </div>
                <CartActions
                  product={item.ProductVariant.Product}
                  cart={cart}
                  accessToken={accessToken}
                  isCartItem={true}
                  onRemoveFromCart={() => {
                    handleItemRemoval(item.id);
                    dispatch(getCart(accessToken));
                  }}
                  onAddToCart={() => dispatch(getCart(accessToken))}
                  variantId={item.ProductVariant.id}
                />
              </div>
            ))}
            {/* <div className="mt-4 text-right">
              <p className="text-xl font-bold">
                Total: ${totalPrice.toFixed(2)}
              </p>
            </div> */}
          </div>

          <div className ="flex flex-col rounded-lg border border-gray-300 bg-white text-[#020817] shadow-sm p-6 ">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>SubTotal</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <div className="flex gap-2 items-center">
                   <Truck className="w-4 h-4" />
                  <span>Shipping</span>
                </div>
                <span>${shippingFee}</span>
              </div>
              <hr className="border-gray-300"></hr>
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>${(totalPrice+shippingFee).toFixed(2)}</span>
                </div>
            </div>
                          <Link href="/checkout">
                <Button className="w-full mt-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  Proceed to Checkout
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              
              <Link href="/products" className="block mt-4">
                <Button variant="outline" className="w-full">
                  Continue Shopping
                </Button>
              </Link>
          </div>
        </div>
      ) : (
        <p>Your cart is empty</p>
      )}
    </div>
  );
}