'use client';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { addToCart, removeFromCart,updateCartItem } from '../../features/thunks/CartThunk';

export default function CartActions({ 
  product, 
  cart, 
  accessToken,
  isCartItem = false,
  onAddToCart,
  onRemoveFromCart ,
  variantId
}) {
  const dispatch = useDispatch();
  const [quantity, setQuantity] = useState(1);
  const [currentCartItem, setCurrentCartItem] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasQuantityChanged, setHasQuantityChanged] = useState(false);

  useEffect(() => {
    if (!cart?.cartItems || !product?.id) return;

    const foundItem = cart.cartItems.find(item => 
      item?.ProductVariant && String(item.ProductVariant.id) === String(variantId)
    );
    
    if (foundItem) {
      setCurrentCartItem(foundItem);
      setQuantity(foundItem.quantity || 1);
      setHasQuantityChanged(false);
    } else {
      setCurrentCartItem(null);
      setQuantity(1);
    }
  }, [cart?.cartItems, product?.id, cart?.cartTotalPrice]); // Added cartTotalPrice as dependency

  const handleQuantityChange = (newQuantity) => {
    setQuantity(newQuantity);
    setHasQuantityChanged(true);
  };

  const handleUpdateCart = async () => {
    if (!product?.id || !cart?.cartID || !accessToken || isLoading) return;
    
    setIsLoading(true);
    try {
      await dispatch(updateCartItem({
        accessToken,
        cartId: cart.cartID,
        cartItemId: currentCartItem.id,
        quantity
      })).unwrap();
      setHasQuantityChanged(false);
      onAddToCart?.();
    } catch (error) {
      console.error('Error updating cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = async () => {
    console.log("inside add to cart", cart.cartID, product.id, quantity,accessToken,isLoading);
    if (!product?.id || !cart?.cartID || !accessToken || isLoading) return;
    
    setIsLoading(true);
    try {
      console.log("inside add to cart", cart.cartID, variantId, quantity);
      await dispatch(addToCart({
        accessToken,
        cartId: cart.cartID,
        variantId: variantId,
        quantity
      })).unwrap();
      onAddToCart?.();
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFromCart = async () => {
    if (!currentCartItem?.id || !cart?.cartID || !accessToken || isLoading) return;
    
    setIsLoading(true);
    try {
      await dispatch(removeFromCart({
        accessToken,
        cartID: cart.cartID,
        cartItemID: currentCartItem.id
      })).unwrap();
      
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