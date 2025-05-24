'use client'
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux";
import { loadProducts } from "../features/thunks/ProductThunks";
import { getProducts, getCurrentPage, getTotalPages } from "../selectors";
import { updateCurrentPage } from "../features/ProductsSlice";
import Image from "next/image";
import Link from "next/link";

export default function Products(){
    const products = useSelector(getProducts);
    let currentPage = useSelector(getCurrentPage);
    let totalPages = useSelector(getTotalPages);    
    const dispatch = useDispatch();
    useEffect(()=>{
        dispatch(loadProducts(currentPage));
    },[dispatch,currentPage,totalPages]);    
    return (
        <>
            <h1 className="text-2xl font-bold ">Products</h1>
            <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
                {products.map((product)=>{
                    return (
                        <Link href={`/products/${product.id}`}
                         className="border border-gray-300 p-4 rounded-lg shadow-md bg-white" key={product.id}>
                            <img src={product.ProductImages[0].url} alt={product.name} className="w-full h-48 object-cover rounded-lg mb-4" />
                            <h2 className="text-xl font-semibold">{product.name}</h2>
                            {/* <p className="text-gray-600 mt-2">{product.description}</p> */}
                            <p className="text-green-600 font-bold mt-2">${product.base_price}</p>
                        </Link>
                    );
                })}
            </div>
            <div className="flex justify-center my-8">
                <button onClick={() => { dispatch(loadProducts(currentPage - 1));}} disabled={currentPage === 1} className="px-4 py-2 mr-2 bg-blue-500 text-white rounded cursor-pointer disabled:bg-gray-300">Previous</button>
                <span className="px-4 py-2 bg-gray-200 rounded">{currentPage}</span>
                <button onClick={() => { dispatch(loadProducts(currentPage + 1));}} disabled={currentPage >= totalPages} className="px-4 py-2 ml-2 bg-blue-500 text-white rounded cursor-pointer disabled:bg-gray-300">Next</button>
            </div>
        </>
    );
}
