'use client';
import axios from 'axios';
import nextConfig from '../../../next.config.mjs';
import Link from 'next/link';
import { Truck, ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from "react-redux";
import { SelectCart,SelectUser } from "../selectors";
import useLocalStorage from "../utils/LocalStorage";
import { getCart } from "../features/thunks/CartThunk";
import CheckoutSteps from '../components/checkoutComponents/steps';
import OrderSummary from '../components/cartComponents/OrderSummary';
import CartItemsList from '../components/cartComponents/CartItemsList';
import ShippingForm from '../components/checkoutComponents/ShippingForm';
import ReviewOrder from '../components/checkoutComponents/ReviewOrder';
import { toast, ToastContainer } from 'react-toastify';
import {useRouter} from 'next/navigation';
// Import Button directly from the file path
import { Button } from '../components/ui/button';
import GuestCartItemsList from "../components/cartComponents/GuestCartItemsList";

import {ClearCart} from '../features/CartSlice';
export default function Checkout(){
    const [currentStep, setCurrentStep] = useState('1');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null); // Add error state
    const dispatch = useDispatch();
    const cart = useSelector(SelectCart);
    const user = useSelector(SelectUser);
    const router =useRouter();
    const [accessToken,setAccessToken] = useLocalStorage("accessToken", "");
    const [shippingInfo, setShippingInfo] = useState(null);
    const shippingFee = 50;
    
    // Refresh cart when mounted
    useEffect(() => {
      if (accessToken) {
        dispatch(getCart(accessToken));
      }
    }, [dispatch, accessToken]);
  
    // Update step when shipping info is provided
    useEffect(() => {
      if(shippingInfo !== null) {
        setCurrentStep('2');
      }
    }, [shippingInfo]);
    
    const handleSubmitOrder = async (e) => {
      e.preventDefault();
      try {
        setLoading(true);
        const response = await axios.post(
          nextConfig.env.API_URL + '/api/orders/from-cart',
          {
            shippingInfo,
            shippingFee
          },
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            withCredentials: true
          }
        );

        // Show success toast and wait for it to complete
        await toast.promise(
          Promise.resolve(response), // Pass the resolved response
          {
            pending: 'Order is processing',
            success: {
              render() {
                return 'Order created successfully';
              },
              // Increase autoClose time to ensure toast is visible
              autoClose: 2000,
            },
            error: 'Order failed to create'
          }
        );

        // Clear cart
        dispatch(ClearCart());
        setLoading(false);

        // Wait for toast to complete before redirecting
        setTimeout(() => {
          router.push('/');
        }, 2000); // Match this with the autoClose time

      } catch (err) {
        setError(err.response?.data?.error || 'Failed to create order');
        setLoading(false);
        toast.error('Failed to create order');
      }
    };

    if (cart?.loadingState === "loading") {
      return <div className="container mx-auto p-4">Loading...</div>;
    }
    
    const totalPrice = cart.cartItems.reduce((total, item) => 
      total + (item.ProductVariant?.price || 0) * (item.quantity || 0), 0
    );
  
    return (
        <section className="py-12">
            <div className="container mx-auto space-y-4 ">
                <Link href='/cart' className="flex gap-1 items-center group">
                    <ArrowLeft className="text-gray-500 group-hover:text-purble-700"/>
                    <span className="text-gray-500 group-hover:text-purble-700">Back To Cart</span>
                </Link>

                <div className="flex flex-col gap-4">
                    <h2 className="text-black font-bold text-2xl">Checkout</h2>
                    {error && <div className="text-red-500">{error}</div>}
                    <div className='space-y-4'>
                        {/* steps  */}
                        <CheckoutSteps currentStep={currentStep} setCurrentStep={setCurrentStep}/>
                        {/* step form and overview */}
                        <div className='grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-6 items-start'>
                            {/* step form */}
                            <div className="flex flex-col rounded-lg border border-gray-300 bg-white text-[#020817] shadow-sm p-6">
                                {currentStep === '1' && (<ShippingForm setShippingInfo={setShippingInfo}/>)}
                                {currentStep === '2' && (
                                  <>
                                  <ReviewOrder shippingFee={shippingFee} totalPrice={totalPrice} shippingInfo={shippingInfo} /> 
                                  <Button onClick={handleSubmitOrder} className="w-full mt-6 bg-green-700 hover:bg-green-500">
                                    {loading ? "Loading..." : "Confirm Order"}
                                    <ArrowRight className="ml-2 w-4 h-4" />
                                  </Button>
                                  </>
                                )}
                            </div>
                            {/* order Summary */}
                            <div className='flex flex-col rounded-lg border border-gray-300 bg-white text-[#020817] shadow-sm p-6 gap-4'>
                                
                                {user.user ? (
          <CartItemsList
            cartItems={cart.cartItems}
            cart={cart}
            accessToken={accessToken}
            dispatch={dispatch}
            getCart={getCart}
            cartPage={false}
          />
        ) : (
          <GuestCartItemsList cartItems={cart.cartItems} cart={cart} cartPage={false} />
        )}
        <OrderSummary totalPrice={totalPrice} shippingFee={shippingFee} cartPage={false} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <ToastContainer/>
        </section>
    );
}
