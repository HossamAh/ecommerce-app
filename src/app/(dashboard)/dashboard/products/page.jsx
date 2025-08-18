"use client";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadProducts, deleteProduct } from "../../../features/thunks/ProductThunks";
import { getProducts, getCurrentPage, getTotalPages } from "../../../selectors";
import { updateCurrentPage } from "../../../features/ProductsSlice";
import Image from "next/image";
import Link from "next/link";
export default function DashboardProducts() {
  const products = useSelector(getProducts);
  let currentPage = useSelector(getCurrentPage);
  let totalPages = useSelector(getTotalPages);
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(loadProducts({page:currentPage,pageSize:12}));
  }, [dispatch, currentPage, totalPages]);

  const handleDelete = async (productID) => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) return;
  
    try {
      await dispatch(deleteProduct(productID, accessToken)).unwrap();
      dispatch(loadProducts({page:currentPage,pageSize:12}));
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Manage Products</h1>
      <Link
        href="products/create"
        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 mb-4 inline-block"
      >
        Create New Product
      </Link>
      <table className="w-full bg-white rounded-lg shadow-md">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-3 text-left">Name</th>
            <th className="p-3 text-left">Price</th>
            <th className="p-3 text-left">Category</th>
            <th className="p-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="border-b">
              <td className="p-3">{product.name}</td>
              <td className="p-3">${product.base_price}</td>
              <td className="p-3">{product.Category.name}</td>
              <td className="p-3">
                <Link
                  href={`products/edit/${product.id}`}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 mr-2"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-center my-8">
        <button
          onClick={() => {
            dispatch(loadProducts({page:currentPage-1,pageSize:12}));
          }}
          disabled={currentPage === 1}
          className="px-4 py-2 mr-2 bg-blue-500 text-white rounded cursor-pointer disabled:bg-gray-300"
        >
          Previous
        </button>
        <span className="px-4 py-2 bg-gray-200 rounded">{currentPage}</span>
        <button
          onClick={() => {
            dispatch(loadProducts({page:currentPage+1,pageSize:12}));
          }}
          disabled={currentPage >= totalPages}
          className="px-4 py-2 ml-2 bg-blue-500 text-white rounded cursor-pointer disabled:bg-gray-300"
        >
          Next
        </button>
      </div>
    </div>
  );
}
