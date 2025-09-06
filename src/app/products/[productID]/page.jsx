'use client';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { use } from 'react';
import { getCurrentProduct, getLoadingState, SelectCart,SelectUser } from '../../selectors';
import { getProduct } from '../../features/thunks/ProductThunks';
import ProductImages from '../../components/productComponents/ProductImages';
import useLocalStorage from '../../utils/LocalStorage';
import { useRouter } from 'next/navigation';
import CartActions from '../../components/cartComponents/CartActions';
import GuestCartActions from '../../components/cartComponents/GuestCartActions';
import { getCart } from "../../features/thunks/CartThunk";
import DOMPurify from 'dompurify';

export default function ProductDetails({ params }) {
  const resolvedParams = use(params);
  const productID = resolvedParams.productID;
  
  const dispatch = useDispatch();
  const router = useRouter();
  const loadingState = useSelector(getLoadingState);
  const product = useSelector(getCurrentProduct);
  const cart = useSelector(SelectCart);
  const user = useSelector(SelectUser);
  const [accessToken,setAccessToken] = useLocalStorage('accessToken','' );
  const [availableColors, setAvailableColors] = useState([]);
  const [availableSizes, setAvailableSizes] = useState([]);
  const [currentColor, setCurrentColor] = useState('');
  const [currentSize, setCurrentSize] = useState('');
  const [oldPrice, setOldPrice] = useState('');
  const [currentPrice, setCurrentPrice] = useState('');
  const [currentImages, setCurrentImages] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const [currentStock, setCurrentStock] = useState(undefined);
  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [paragraph,setParagraph] = useState('');



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

  // Sanitize the HTML string to remove any malicious code
  useEffect(()=>{
    if(product?.description){
      console.log(product.description);
      setParagraph(DOMPurify.sanitize(product.description));
    }
  },[product])

  // construct current images from the product images and main image and variants images
  useEffect(()=>{
    if(product)
    {
      console.log(product);
    let variantsImages = [];
    product?.ProductVariants?.forEach((variant)=>{
      variantsImages.push(variant.ProductImage);
    });
    console.log(variantsImages);
    console.log(product.ProductImages);
    setCurrentImages([...product.ProductImages,...variantsImages]);
  }
  },[product])

  // First, let's extract unique colors and sizes from the variants
  useEffect(() => {
    if (product?.ProductVariants) {
      // Extract unique colors and sizes
      const uniqueColors = [];
      const uniqueSizes = [];
      const colorMap = new Map();
      const sizeMap = new Map();
      Object.values(product.ProductVariants).forEach(variant => {
        variant.ProductAttributeValues.forEach(attributeValue=>{
        if ((attributeValue.ProductAttribute.name==='color'|| attributeValue.ProductAttribute.name==='Color') && !colorMap.has(attributeValue.id)) {
          colorMap.set(attributeValue.id, attributeValue.value);
          uniqueColors.push(attributeValue);
        }
        
        if ((attributeValue.ProductAttribute.name==='size'||attributeValue.ProductAttribute.name==='Size') && !sizeMap.has(attributeValue.id)) {
          sizeMap.set(attributeValue.id, attributeValue.value);
          uniqueSizes.push(attributeValue);
        }
        });

      });
      
      setAvailableColors(uniqueColors);
      setAvailableSizes(uniqueSizes);
      
      // Set default selections if available
      if (uniqueColors.length > 0 && !currentColor) {
        setCurrentColor(uniqueColors[0]);
      }
      if (uniqueSizes.length > 0 && !currentSize) {
        setCurrentSize(uniqueSizes[0]);
      }
    }
  }, [product]);

  // Update product data when color or size changes
  useEffect(() => {
    if (product?.ProductVariants && currentColor && currentSize) {
      // Find the variant that matches the selected color and size
      const selectedVariant = Object.values(product.ProductVariants).find(variant => 
        
        // variant.ProductAttributeValues.find((valueObj=>valueObj.value === currentColor.value))  && variant.ProductAttributeValues.find((valueObj=>valueObj.value === currentSize.value))
        variant.ProductAttributeValues.find((valueObj=>valueObj.value === currentColor.value))
      );
      
      if (selectedVariant) {
        // Update price
        setOldPrice(selectedVariant.price.toFixed(2));
        const discountedPrice = product.discount_percentage 
          ? selectedVariant.price * (1 - product.discount_percentage / 100) 
          : selectedVariant.price;
        
        setCurrentPrice(discountedPrice.toFixed(2));
        
        // Update images
        if (selectedVariant.ProductImage ) {
          setCurrentImage(selectedVariant.ProductImage);
        }
        
        // Update stock information
        setCurrentStock(selectedVariant.stock);
        
        // Store the selected variant ID
        setSelectedVariantId(selectedVariant.id);
        setSelectedVariant(selectedVariant);
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
          <div className="relative w-full h-full">
            {product.discount_percentage>0 &&
            (<div className="absolute bg-blue-500 p-2 rounded-tr-xl rounded-bl-xl z-20 right-3 top-3">
              <h3 className="font-semibold text-white">- {product.discount_percentage}%</h3>
            </div>)
            }

          {currentImages && currentImages.length > 0 ? (
            <ProductImages ProductImages={currentImages}  currentImage={currentImage} />
          ):''
          }
          </div>
        <div className="flex flex-col gap-4">
          {/* <p className="text-gray-700 mb-4">{product.description}</p> */}
          <div dangerouslySetInnerHTML={{ __html: paragraph }} />

          
          {/* Color variants */}
          {availableColors.length > 0 && (
            <div className="flex flex-col gap-2 mb-4">
              <label className="text-lg font-semibold">Color:</label>
              <div className="flex flex-wrap gap-2">
                {availableColors.map((color) => (
                  <button
                    key={color.id}
                    className={`px-4 py-2 rounded-full flex items-center gap-2 ${
                      color === currentColor
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200'
                    }`}
                    onClick={() => setCurrentColor(color)}
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
                      size === currentSize
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200'
                    }`}
                    onClick={() => setCurrentSize(size)}
                  >
                    {size.code}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Display current price */}
          <div className="flex items-center gap-2">
            <p className="text-lg font-semibold text-gray-600 line-through mb-2">
              ${oldPrice||(product.base_price ? product.base_price.toFixed(2) : '0.00')}
            </p>
            <p className="text-2xl font-bold text-green-600 mb-2">
              ${currentPrice||(product.base_price && product.discount_percentage ? (product.base_price -(product.base_price*product.discount_percentage/100) ).toFixed(2) : '0.00')}
            </p>
          </div>

          {/* Display stock information */}
          {currentStock !== undefined && (
            <p className={`mb-4 ${currentStock > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {currentStock > 0 
                ? `In Stock (${currentStock} available)` 
                : 'Out of Stock'}
            </p>
          )}

          {user?.user?
          (
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
          ):
          (
            <GuestCartActions 
            product={product}
            onAddToCart={() => {
              router.push('/cart');
            }}
            onRemoveFromCart={() => {
            }}
            variant={selectedVariant}
          />
          )}
          
        </div>
      </div>
    </div>
  );
}
