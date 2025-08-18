'use client'
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux";
import { loadProducts } from "../features/thunks/ProductThunks";
import { getProducts, getCurrentPage, getTotalPages,SelectCart } from "../selectors";
import { updateCurrentPage } from "../features/ProductsSlice";
import useLocalStorage from '../utils/LocalStorage';
import Image from "next/image";
import Link from "next/link";
import { getCart } from "../features/thunks/CartThunk";
import CartActions from '../components/cartComponents/CartActions';
import nextConfig from '../../../next.config.mjs';

export default function Products(){
    const products = useSelector(getProducts);
    let currentPage = useSelector(getCurrentPage);
    let totalPages = useSelector(getTotalPages); 
    const cart = useSelector(SelectCart);
    const [accessToken,setAcessToken] = useLocalStorage('accessToken','' );
    const dispatch = useDispatch();
    useEffect(()=>{
        dispatch(loadProducts({page:currentPage,pageSize:12}));
    },[dispatch,currentPage,totalPages]);  
    useEffect(() => {
        if (accessToken) {
          dispatch(getCart(accessToken));
        }
      }, [dispatch, accessToken]);
    
    return (
        <>
            <h1 className="text-2xl font-bold ">Products</h1>
            <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
                {products.map((product)=>{
                    return (
                        <Link href={`/products/${product.id}`}
                         className="border border-gray-300 p-4 rounded-lg shadow-md bg-white" key={product.id}>
                            <img  src={(product.ProductImages[0].url).search('uploads')>=0 ?`${nextConfig.env.API_URL}/${product.ProductImages[0].url}` :product.ProductImages[0].url} alt={product.name} className="w-full h-48 rounded-lg mb-4" />
                            <h2 className="text-xl font-semibold">{product.name}</h2>
                            {/* <p className="text-gray-600 mt-2">{product.description}</p> */}
                            <div className="flex justify-between items-center mt-2 gap-4">
                                <p className="text-green-600 font-bold ">${product.base_price}</p>
                                <CartActions
                                product={product}
                                            cart={cart}
                                            accessToken={accessToken}
                                            onAddToCart={() => {
                                              dispatch(getCart(accessToken));
                                              router.push('/cart');
                                            }}
                                            variantId={product?.ProductVariants[0]?.id}
                                ></CartActions>
                            </div>
                        </Link>
                    );
                })}
            </div>
            <div className="flex justify-center my-8">
                <button onClick={() => { dispatch(loadProducts({page:currentPage - 1,pageSize:12}));}} disabled={currentPage === 1} className="px-4 py-2 mr-2 bg-blue-500 text-white rounded cursor-pointer disabled:bg-gray-300">Previous</button>
                <span className="px-4 py-2 bg-gray-200 rounded">{currentPage}</span>
                <button onClick={() => { dispatch(loadProducts({page:currentPage + 1,pageSize:12}));}} disabled={currentPage >= totalPages} className="px-4 py-2 ml-2 bg-blue-500 text-white rounded cursor-pointer disabled:bg-gray-300">Next</button>
            </div>
        </>
    );
}
