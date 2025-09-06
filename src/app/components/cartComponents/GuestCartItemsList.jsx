import React from 'react';
import Link from "next/link";
import GuestCartActions from "./GuestCartActions";
import {useEffect} from 'react';
import nextConfig from '../../../../next.config.mjs';
import { useRouter } from 'next/navigation';

export default function GuestCartItemsList({ cartItems, cart, handleItemRemoval,cartPage=true }) {
  const router = useRouter();
  useEffect(()=>console.log("inside guest cart list:",cartItems),[]);
  //guest cart item only have id,ProductVariantId ,quantity 
  return (
    <div className="grid grid-cols-1 gap-4">
      {cartItems.map((item) => (
        <div
          key={item.id}
          className="border border-gray-300 p-4 rounded-lg shadow grid grid-cols-1 items-center gap-4"
        >
          <div className="flex justify-between gap-4">
            <Link href={`/products/${item?.ProductVariant?.ProductId}`} className="flex-shrink-0" >
              {item?.ProductVariant?.ProductImage?.url && (
                <img
                  src={(item?.ProductVariant?.ProductImage?.url.includes("uploads"))
                    ? `${nextConfig.env.API_URL}/${item.ProductVariant?.ProductImage?.url}`
                    : item.ProductVariant?.ProductImage?.url
                  }
                  alt={item.ProductVariant?.Product?.name}
                  className="w-24 h-24 object-cover rounded"
                />
              )}
            </Link>
            <div className="flex-grow">
              <Link href={`/products/${item?.Product?.id}`}>
                <h2 className="text-xl font-semibold">{item?.Product?.name}</h2>
              </Link>
              <p className="text-green-600 font-bold">
                ${(item?.ProductVariant?.price).toFixed(2)}
              </p>
              <p className="text-gray-600">Quantity: {item?.quantity}</p>
              {item?.ProductVariant?.ProductAttributeValues.map((attributeValue)=>
                <p key={attributeValue.id} className="text-gray-600">{attributeValue.ProductAttribute.name}: {attributeValue.value}</p>
              )}

              
            </div>
          </div>
          { cartPage &&
          (<GuestCartActions
            product={item?.Product}
            onAddToCart={() => {
            router.push('/cart');
            }}
            isCartItem={true}
            onRemoveFromCart={() => (
              handleItemRemoval(item.id)
            )}
            variant={item?.ProductVariant}
          />
          )}
        </div>
      ))}
    </div>
  );
}