import React from 'react';
import Link from "next/link";
import { Truck, ArrowRight } from "lucide-react";
import { Button } from "../ui/button";

export default function OrderSummary({ totalPrice, shippingFee,cartPage=true }) {
  return (
    <div className="flex flex-col rounded-lg border border-gray-300 bg-white text-[#020817] shadow-sm p-6">
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
      {
        cartPage &&
      (<>
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
      </>)
      }
    </div>
  );
}
