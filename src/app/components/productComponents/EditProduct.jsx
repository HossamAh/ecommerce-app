'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import dynamic from 'next/dynamic';
import { useRouter } from "next/navigation";
import { useQuery } from '@tanstack/react-query';
import { loadCategories } from '../../utils/categoriesAPIs';
import useLocalStorage from '../../utils/LocalStorage';
import 'react-quill-new/dist/quill.snow.css';
import { Input } from "@/components/ui/input";
import nextConfig from '../../../../next.config.mjs';

const ReactQuill = dynamic(() => import('react-quill-new'), {
  ssr: false,
  loading: () => <p>Loading editor...</p>
});

const EditProduct = ({ productId }) => {
    const [images, setImages] = useState([]);
    const [product, setProduct] = useState(null);
    const router = useRouter();
    const [accessToken] = useLocalStorage('accessToken', '');

    // Fetch categories
    const { data: categories } = useQuery({
        queryKey: ['CategoriesData'],
        queryFn: () => loadCategories({
            accessToken: accessToken,
            page: 1,
            pageSize: 100
        })
    });

    // Fetch product data
    useEffect(() => {
        console.log(productId);
        const fetchProduct = async () => {
            try {
                const response = await axios.get(
                    `${nextConfig.env.API_URL}/api/products/${productId}`,
                    {
                        headers: { 'Authorization': `Bearer ${accessToken}` },
                        withCredentials: true
                    }
                );
                setProduct(response.data);
            } catch (error) {
                console.error('Error fetching product:', error);
            }
        };
        if (productId) fetchProduct();
    }, [productId, accessToken]);

    const initialValues = {
        name: product?.name || '',
        base_price: product?.base_price || '',
        description: product?.description || '',
        CategoryId: product?.CategoryId || '',
        mainImage: null,
    };

    const validationSchema = Yup.object({
        name: Yup.string().required('Name is required'),
        base_price: Yup.number().required('Price is required').positive('Price must be positive'),
        description: Yup.string().required('Description is required'),
        CategoryId: Yup.string().required('Category is required'),
        mainImage: Yup.mixed(), // Not required for edit
    });

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setImages(files);
    };

    const handleSubmit = async (values) => {
        const formData = new FormData();
        formData.append('name', values.name);
        formData.append('base_price', values.base_price);
        formData.append('description', values.description);
        formData.append('CategoryId', values.CategoryId);
        
        if (values.mainImage) {
            formData.append('mainImage', values.mainImage);
        }
        
        if (images.length > 0) {
            images.forEach((image) => {
                formData.append('images', image);
            });
        }

        try {
            await axios.put(
                `${nextConfig.env.API_URL}/api/products/${productId}`,
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'multipart/form-data',
                    },
                    withCredentials: true
                }
            );
            router.push('/dashboard/products');
        } catch (error) {
            console.error('Error updating product:', error);
        }
    };

    if (!product) return 'Loading...'; 

    return (
        <div className="p-6">
            <h1 className="mb-6 text-3xl font-bold">Edit Product</h1>
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
                enableReinitialize
            >
                {({ setFieldValue }) => (
                    <Form className="space-y-6">
                        <div className="mb-4">
                            <label className="block mb-2 text-sm font-medium">Name</label>
                            <Field
                                name="name"
                                type="text"
                                className="w-full p-2 border rounded"
                            />
                            <ErrorMessage name="name" component="div" className="text-sm text-red-500" />
                        </div>
                        <div className="mb-4">
                            <label className="block mb-2 text-sm font-medium">Price</label>
                            <Field
                                name="base_price"
                                type="number"
                                className="w-full p-2 border rounded"
                            />
                            <ErrorMessage name="base_price" component="div" className="text-sm text-red-500" />
                        </div>
                        <div className="mb-4">
                            <label className="block mb-2 text-sm font-medium">Description</label>
                            {typeof window !== 'undefined' && (
                                <Field name="description">
                                    {({ field }) => (
                                        <ReactQuill
                                            value={field.value}
                                            onChange={(value) => setFieldValue('description', value)}
                                        />
                                    )}
                                </Field>
                            )}
                            <ErrorMessage name="description" component="div" className="text-sm text-red-500" />
                        </div>
                        <div className="mb-4">
                            <label className="block mb-2 text-sm font-medium">Category</label>
                            <Field
                                name="CategoryId"
                                as="select"
                                className="w-full p-2 border rounded"
                            >
                                <option value="">Select a category</option>
                                {categories?.categories?.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </Field>
                            <ErrorMessage name="CategoryId" component="div" className="text-sm text-red-500" />
                        </div>
                        <div className="mb-4">
                            <label className="block mb-2 text-sm font-medium">Main Image</label>
                            <div className="space-y-2">
                                {product.mainImage && (
                                    <img 
                                        src={product.mainImage} 
                                        alt="Current main image" 
                                        className="w-32 h-32 object-cover rounded"
                                    />
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(event) => {
                                        const file = event.currentTarget.files[0];
                                        setFieldValue('mainImage', file);
                                    }}
                                    className="w-full p-2 border rounded"
                                />
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block mb-2 text-sm font-medium">Additional Images</label>
                            <div className="space-y-2">
                                <div className="flex gap-2 mb-2">
                                    {product.images?.map((image, index) => (
                                        <img 
                                            key={index}
                                            src={image} 
                                            alt={`Product image ${index + 1}`}
                                            className="w-24 h-24 object-cover rounded"
                                        />
                                    ))}
                                </div>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="w-full p-2 border rounded"
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            className="w-full p-2 text-white bg-blue-500 rounded hover:bg-blue-600"
                        >
                            Save Changes
                        </button>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default EditProduct;