import React from 'react';
import Link from "next/link";
import CartActions from "./CartActions";

export default function CartItemsList({ cartItems, cart, accessToken, handleItemRemoval, dispatch, getCart,cartPage=true }) {
  return (
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
              {item?.ProductVariant?.ProductAttributeValues.map((attributeValue)=>
                <p key={attributeValue.id} className="text-gray-600">{attributeValue.ProductAttribute.name}: {attributeValue.value}</p>
              )}

              
            </div>
          </div>
          { cartPage &&
          (<CartActions
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
          />)
          }
        </div>
      ))}
    </div>
  );
}