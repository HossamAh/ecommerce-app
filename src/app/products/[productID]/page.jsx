'use client';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { use } from 'react';
import { getCurrentProduct, getLoadingState, SelectCart } from '../../selectors';
import { getProduct } from '../../features/thunks/ProductThunks';
import ProductImages from '../../components/productComponents/ProductImages';
import useLocalStorage from '../../utils/LocalStorage';
import { useRouter } from 'next/navigation';
import CartActions from '../../components/cartComponents/CartActions';
import { getCart } from "../../features/thunks/CartThunk";

export default function ProductDetails({ params }) {
  const resolvedParams = use(params);
  const productID = resolvedParams.productID;
  
  const dispatch = useDispatch();
  const router = useRouter();
  const loadingState = useSelector(getLoadingState);
  const product = useSelector(getCurrentProduct);
  const cart = useSelector(SelectCart);
  const [accessToken,setAcessToken] = useLocalStorage('accessToken','' );
  const [availableColors, setAvailableColors] = useState([]);
  const [availableSizes, setAvailableSizes] = useState([]);
  const [currentColor, setCurrentColor] = useState('');
  const [currentSize, setCurrentSize] = useState('');
  const [currentPrice, setCurrentPrice] = useState('');
  const [currentImages, setCurrentImages] = useState(null);
  const [currentStock, setCurrentStock] = useState(undefined);
  const [selectedVariantId, setSelectedVariantId] = useState(null);

  useEffect(() => {
    if (productID) {
      dispatch(getProduct(productID));
    }
  }, [dispatch, productID]);

  // Add new effect for cart fetching
  useEffect(() => {
    if (accessToken) {
      dispatch(getCart(accessToken));
    }
  }, [dispatch, accessToken]);

  // First, let's extract unique colors and sizes from the variants
  useEffect(() => {
    if (product?.ProductVariants) {
      // Extract unique colors and sizes
      const uniqueColors = [];
      const uniqueSizes = [];
      const colorMap = new Map();
      const sizeMap = new Map();
      
      Object.values(product.ProductVariants).forEach(variant => {
        if (variant.Color && !colorMap.has(variant.Color.id)) {
          colorMap.set(variant.Color.id, variant.Color);
          uniqueColors.push(variant.Color);
        }
        
        if (variant.Size && !sizeMap.has(variant.Size.id)) {
          sizeMap.set(variant.Size.id, variant.Size);
          uniqueSizes.push(variant.Size);
        }
      });
      
      setAvailableColors(uniqueColors);
      setAvailableSizes(uniqueSizes);
      
      // Set default selections if available
      if (uniqueColors.length > 0 && !currentColor) {
        setCurrentColor(uniqueColors[0].name);
      }
      if (uniqueSizes.length > 0 && !currentSize) {
        setCurrentSize(uniqueSizes[0].name);
      }
    }
  }, [product]);

  // Update product data when color or size changes
  useEffect(() => {
    if (product?.ProductVariants && currentColor && currentSize) {
      // Find the variant that matches the selected color and size
      const selectedVariant = Object.values(product.ProductVariants).find(variant => 
        variant.Color?.name === currentColor && variant.Size?.name === currentSize
      );
      
      if (selectedVariant) {
        // Update price
        const discountedPrice = selectedVariant.discount_percentage 
          ? selectedVariant.price * (1 - selectedVariant.discount_percentage / 100) 
          : selectedVariant.price;
        
        setCurrentPrice(discountedPrice.toFixed(2));
        
        // Update images
        if (selectedVariant.ProductImages && selectedVariant.ProductImages.length > 0) {
          setCurrentImages(selectedVariant.ProductImages);
        }
        
        // Update stock information
        setCurrentStock(selectedVariant.stock);
        
        // Store the selected variant ID
        setSelectedVariantId(selectedVariant.id);
      }
    }
  }, [currentColor, currentSize, product]);

  if (loadingState === 'loading') {
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  if (loadingState === 'failed') {
    return <div className="container mx-auto p-4">Error loading product.</div>;
  }

  if (!product) {
    return <div className="container mx-auto p-4">Product not found.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4 text-center">{product.name}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Display product images based on selected variant */}
          {currentImages && currentImages.length > 0 ? (
            <ProductImages ProductImages={currentImages} />
          ) : (
            product.ProductImages?.length > 0 && (
              <ProductImages ProductImages={product.ProductImages} />
            )
          )}
        <div className="flex flex-col gap-4">
          <p className="text-gray-700 mb-4">{product.description}</p>
          
          {/* Color variants */}
          {availableColors.length > 0 && (
            <div className="flex flex-col gap-2 mb-4">
              <label className="text-lg font-semibold">Color:</label>
              <div className="flex flex-wrap gap-2">
                {availableColors.map((color) => (
                  <button
                    key={color.id}
                    className={`px-4 py-2 rounded-full flex items-center gap-2 ${
                      color.name === currentColor
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200'
                    }`}
                    onClick={() => setCurrentColor(color.name)}
                    style={{ borderColor: color.code }}
                  >
                    <span 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: color.code }}
                    ></span>
                    {color.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size variants */}
          {availableSizes.length > 0 && (
            <div className="flex flex-col gap-2 mb-4">
              <label className="text-lg font-semibold">Size:</label>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map((size) => (
                  <button
                    key={size.id}
                    className={`px-4 py-2 rounded-full ${
                      size.name === currentSize
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200'
                    }`}
                    onClick={() => setCurrentSize(size.name)}
                  >
                    {size.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Display current price */}
          <p className="text-2xl font-bold text-green-600 mb-2">
            ${currentPrice || (product.price ? product.price.toFixed(2) : '0.00')}
          </p>

          {/* Display stock information */}
          {currentStock !== undefined && (
            <p className={`mb-4 ${currentStock > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {currentStock > 0 
                ? `In Stock (${currentStock} available)` 
                : 'Out of Stock'}
            </p>
          )}


          <CartActions 
            product={product}
            cart={cart}
            accessToken={accessToken}
            onAddToCart={() => {
              dispatch(getCart(accessToken));
              router.push('/cart');
            }}
            onRemoveFromCart={() => {
              dispatch(getCart(accessToken));
            }}
            variantId={selectedVariantId}

          />
        </div>
      </div>
    </div>
  );
}
