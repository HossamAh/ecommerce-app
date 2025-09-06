'use client';
import { useEffect, useState } from 'react';
import { useDispatch ,useSelector} from 'react-redux';
import {GuestAddToCart,GuestUpdateCartItem,GuestRemoveFromCart} from '../../features/CartSlice';
import {SelectCart} from '../../selectors';
export default function GuestCartActions({ 
  product,
  isCartItem = false,
  onAddToCart,
  onRemoveFromCart ,
  variant
}) {
  const dispatch = useDispatch();
  const [quantity, setQuantity] = useState(1);
  const [oldQuantity, setOldQuantity] = useState(1);
  const [currentCartItem, setCurrentCartItem] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasQuantityChanged, setHasQuantityChanged] = useState(false);

  const cart = useSelector(SelectCart);
  const cartItem = {
      quantity,
      ProductVariantId: variant?.id,
      ProductVariant:variant,
      Product:product
    };
  const price = (variant?.price - (variant?.price*product?.discount_percentage/100));
  useEffect(()=>{
    if(hasQuantityChanged===false)
    {
      setOldQuantity(quantity);
    }
  },[hasQuantityChanged])
  useEffect(() => {
    if (!product?.id) return;
    console.log("current cart",cart);
    console.log(variant);
    const foundItem = cart.cartItems.find(item => 
      String(item?.ProductVariantId) === String(variant?.id)
    );
    
    console.log("fountItem :",foundItem);
    if (foundItem) {
      setCurrentCartItem(foundItem);
      setQuantity(foundItem.quantity || 1);
      setHasQuantityChanged(false);
    } else {
      setCurrentCartItem(null);
      setQuantity(1);
    }
  }, [variant,cart?.cartItems, product?.id, cart?.cartTotalPrice]); // Added cartTotalPrice as dependency

  const handleQuantityChange = (newQuantity) => {
    setQuantity(newQuantity);
    setHasQuantityChanged(true);
  };

  const handleUpdateCart = async (e) => {
    e.preventDefault();
    if (!product?.id || isLoading) return;
    
    setIsLoading(true);
    try {
      await dispatch(GuestUpdateCartItem({
        cartItem:{...currentCartItem,quantity:quantity},
        oldPrice:oldQuantity*price,
        price:quantity*price,
      }));
      setHasQuantityChanged(false);
      onAddToCart?.();
    } catch (error) {
      console.error('Error updating cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!product?.id || isLoading) return;
    
    setIsLoading(true);
    try {
      console.log("inside add to cart", variant, quantity);
      
      await dispatch(GuestAddToCart({
        cartItem,
        price
      }));
      onAddToCart?.();
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFromCart = async (e) => {
    e.preventDefault();
    if (!currentCartItem?.id  || isLoading) return;
    
    setIsLoading(true);
    try {
      await dispatch(GuestRemoveFromCart({
        cartItem:currentCartItem,
        price:price*quantity
      }));
      
      setCurrentCartItem(null);
      setQuantity(1);
      onRemoveFromCart?.();
    } catch (error) {
      console.error('Error removing from cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!product || !cart) return null;

  return (
    <div className="flex justify-between gap-4">
      {(currentCartItem && isCartItem) && (
        <div className="flex items-center gap-4">
          <button 
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-300"
            onClick={() => handleQuantityChange(quantity + 1)}
            disabled={isLoading}
          >
            +
          </button>
          <span className="text-lg font-semibold">{quantity}</span>
          <button 
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-300"
            onClick={() => handleQuantityChange(Math.max(1, quantity - 1))}
            disabled={quantity <= 1 || isLoading}
          >
            -
          </button>
          {currentCartItem && hasQuantityChanged && (
            <button
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:bg-gray-300"
              onClick={handleUpdateCart}
              disabled={isLoading}
            >
              {isLoading ? 'Updating...' : 'Update'}
            </button>
          )}
        </div>
      )}
      
      <div className="flex gap-4">
        {!currentCartItem && !isCartItem && (
          <button 
            className="w-full bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-300"
            onClick={handleAddToCart}
            disabled={isLoading}
          >
            {isLoading ? 'Adding...' : 'Add to Cart'}
          </button>
        )}
        {currentCartItem && (
          <button 
            className="w-full bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 disabled:bg-gray-300"
            onClick={handleRemoveFromCart}
            disabled={isLoading}
          >
            {isLoading ? 'Removing...' : 'Remove from Cart'}
          </button>
        )}
      </div>
    </div>
  );
}