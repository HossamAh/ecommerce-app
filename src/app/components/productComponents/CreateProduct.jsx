'use client';
import React, { useState } from 'react';
import axios from 'axios';
import { Formik, Form, Field, ErrorMessage, FieldArray } from 'formik';
import * as Yup from 'yup';
import dynamic from 'next/dynamic';
import { useRouter } from "next/navigation";
import { useQuery } from '@tanstack/react-query';
import { loadCategories } from '../../utils/categoriesAPIs';
import useLocalStorage from '../../utils/LocalStorage';
import 'react-quill-new/dist/quill.snow.css';
import nextConfig from '../../../../next.config.mjs';
import { getProductVariantAttributes, getProductVariantAttributesValueByAttribute } from '../../utils/APIs';

// Dynamically import ReactQuill with ssr disabled
const ReactQuill = dynamic(() => import('react-quill-new'), {
    ssr: false,
    loading: () => <p>Loading editor...</p>
});

// A sub-component to handle fetching and displaying attribute values based on the selected attribute name.
const AttributeValueSelector = ({ attributeId, name, disabled }) => {
    const { data: values, isLoading } = useQuery({
        queryKey: ['attributeValues', attributeId],
        queryFn: () => getProductVariantAttributesValueByAttribute(attributeId),
        enabled: !!attributeId, // Only fetch if an attribute is selected
        select: (data)=>{console.log(data.data); return data.data;}
    });

    return (
        <Field as="select" name={name} className="w-full p-2 border rounded" disabled={disabled || isLoading}>
            <option value="">{isLoading ? 'Loading...' : 'Select Value'}</option>
            {values?.map(val => (
                <option key={val.id} value={val.id}>{val.value}</option>
            ))}
        </Field>
    );
};

const CreateProduct = () => {
    const [images, setImages] = useState([]);
    const router = useRouter();
    const [accessToken] = useLocalStorage('accessToken', '');

    const { isPending, error, data: categories, isFetching } = useQuery({
        queryKey: ['CategoriesData'],
        queryFn: () => loadCategories({
            accessToken: accessToken,
            page: 1,
            pageSize: 100
        })
    });

    const { data: productAttributesData, isFetching: isFetchingVariantAttributes } = useQuery({
        queryKey: ['VariantAttributesData'],
        queryFn: () => getProductVariantAttributes({
            page: 1,
            pageSize: 100
        })
    });

    const initialValues = {
        name: '',
        base_price: '',
        description: '',
        CategoryId: '',
        discount_percentage:'',
        mainImage: null,
        variants: []
    };

    const validationSchema = Yup.object({
        name: Yup.string().required('Name is required'),
        base_price: Yup.number().required('Price is required').positive('Price must be positive'),
        description: Yup.string().required('Description is required'),
        CategoryId: Yup.string().required('Category is required'),
        mainImage: Yup.mixed().required('Main image is required'),
        discount_percentage: Yup.number().min(0).max(100),
        variants: Yup.array().of(
            Yup.object().shape({
                price: Yup.number().required('Price is required'),
                stock: Yup.number().required('Stock is required'),
                image: Yup.mixed().required('An image is required for the variant'),
                variantsAttributes: Yup.array().of(
                    Yup.object().shape({
                        name: Yup.string().required('Attribute name is required'),
                        value: Yup.string().required('Attribute value is required'),
                    })
                )
            })
        )
    });

    const handleImageChange = (e) => {
        setImages([...e.target.files]);
    };

    const handleSubmit = async (values) => {
        const formData = new FormData();

        // Append main product fields
        formData.append('name', values.name);
        formData.append('base_price', values.base_price);
        formData.append('description', values.description);
        formData.append('CategoryId', values.CategoryId);
        if (values.mainImage) {
            formData.append('mainImage', values.mainImage);
        }
        formData.append('discount_percentage', values.discount_percentage);
        
        images.forEach(image => formData.append('images', image));

        // Append variants data using indexed fields for compatibility with multipart forms
        values.variants.forEach((variant, index) => {
            formData.append(`variants[${index}][price]`, variant.price);
            formData.append(`variants[${index}][stock]`, variant.stock);
            if (variant.image) {
                formData.append(`variants[${index}][image]`, variant.image);
            }
            formData.append(`variants[${index}][variantsAttributes]`, JSON.stringify(variant.variantsAttributes));
        });

        // Log formData contents for debugging
        for (let [key, value] of formData.entries()) {
            console.log(`${key}: ${value}`);
        }

        try {
            await axios.post(`${nextConfig.env.API_URL}/api/products`, formData, {
                withCredentials: true,
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    // Content-Type is automatically set by the browser for multipart/form-data
                },
            });
            router.push('/dashboard/products');
        } catch (error) {
            console.error(error);
        }
    };

    if (isPending) return 'Loading...';
    if (error) return 'An error has occurred: ' + error.message;
    if (isFetching || isFetchingVariantAttributes) return 'Updating...';
    const productAttributes = productAttributesData?.data?.productAttributes || [];
    return (
        <div className="p-6">
            <h1 className="mb-6 text-3xl font-bold">Create Product</h1>
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ values, setFieldValue }) => (
                    <Form>
                        {/* Product Fields */}
                        <div className="mb-4">
                            <label className="block mb-2 text-sm font-medium">Name</label>
                            <Field name="name" type="text" className="w-full p-2 border rounded" />
                            <ErrorMessage name="name" component="div" className="text-sm text-red-500" />
                        </div>
                        <div className="mb-4">
                            <label className="block mb-2 text-sm font-medium">Price</label>
                            <Field name="base_price" type="number" className="w-full p-2 border rounded" />
                            <ErrorMessage name="base_price" component="div" className="text-sm text-red-500" />
                        </div>
                        <div className="mb-4">
                            <label className="block mb-2 text-sm font-medium">Discount %</label>
                            <Field name="discount_percentage" type="number" className="w-full p-2 border rounded" />
                            <ErrorMessage name="discount_percentage" component="div" className="text-sm text-red-500" />
                        </div>
                        <div className="mb-4">
                            <label className="block mb-2 text-sm font-medium">Description</label>
                            <Field name="description">
                                {({ field }) => <ReactQuill value={field.value} onChange={(value) => setFieldValue('description', value)} />}
                            </Field>
                            <ErrorMessage name="description" component="div" className="text-sm text-red-500" />
                        </div>
                        <div className="mb-4">
                            <label className="block mb-2 text-sm font-medium">Category</label>
                            <Field name="CategoryId" as="select" className="w-full p-2 border rounded">
                                <option value="">Select a category</option>
                                {categories?.categories?.map((category) => (
                                    <option key={category.id} value={category.id}>{category.name}</option>
                                ))}
                            </Field>
                            <ErrorMessage name="CategoryId" component="div" className="text-sm text-red-500" />
                        </div>
                        <div className="mb-4">
                            <label className="block mb-2 text-sm font-medium">Main Image</label>
                            <input type="file" accept="image/*" onChange={(event) => setFieldValue('mainImage', event.currentTarget.files[0])} className="w-full p-2 border rounded" />
                            <ErrorMessage name="mainImage" component="div" className="text-sm text-red-500" />
                        </div>
                        <div className="mb-4">
                            <label className="block mb-2 text-sm font-medium">Additional Images</label>
                            <input type="file" multiple accept='image/*' onChange={handleImageChange} className="w-full p-2 border rounded" />
                        </div>

                        {/* Variants Section */}
                        <div className="p-4 border-2 border-gray-200 rounded-md">
                            <h2 className="mb-4 text-xl font-semibold">Product Variants</h2>
                            <FieldArray
                                name="variants"
                                render={arrayHelpers => (
                                    <div>
                                        {values.variants?.map((variant, index) => (
                                            <div className="p-4 mb-4 border rounded-md" key={index}>
                                                <div className="flex items-center justify-between mb-2">
                                                    <h3 className="font-bold">{`Variant #${index + 1}`}</h3>
                                                    <button type="button" onClick={() => arrayHelpers.remove(index)} className="p-2 text-white bg-red-500 rounded">Remove Variant</button>
                                                </div>
                                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                    <div>
                                                        <label className="block text-sm font-medium">Price</label>
                                                        <Field name={`variants.${index}.price`} type="number" className="w-full p-2 border rounded" />
                                                        <ErrorMessage name={`variants.${index}.price`} component="div" className="text-sm text-red-500" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium">Stock</label>
                                                        <Field name={`variants.${index}.stock`} type="number" className="w-full p-2 border rounded" />
                                                        <ErrorMessage name={`variants.${index}.stock`} component="div" className="text-sm text-red-500" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium">Variant Image</label>
                                                        <input name={`variants.${index}.image`} type="file" accept="image/*" onChange={(event) => setFieldValue(`variants.${index}.image`, event.currentTarget.files[0])} className="w-full p-2 border rounded" />
                                                        <ErrorMessage name={`variants.${index}.image`} component="div" className="text-sm text-red-500" />
                                                    </div>
                                                </div>
                                                <div className="mt-4">
                                                    <h4 className="font-semibold">Attributes</h4>
                                                    <FieldArray
                                                        name={`variants.${index}.variantsAttributes`}
                                                        render={attributeArrayHelpers => (
                                                            <div>
                                                                {variant.variantsAttributes?.map((attr, attrIndex) => (
                                                                    <div key={attrIndex} className="flex items-center gap-2 mt-2">
                                                                        <Field as="select" name={`variants.${index}.variantsAttributes.${attrIndex}.name`} className="w-full p-2 border rounded" onChange={(e) => {
                                                                            setFieldValue(`variants.${index}.variantsAttributes.${attrIndex}.name`, e.target.value);
                                                                            setFieldValue(`variants.${index}.variantsAttributes.${attrIndex}.value`, ''); // Reset value on name change
                                                                        }}>
                                                                            <option value="">Select Name</option>
                                                                            {productAttributes?.map((att) => (
                                                                                <option key={att.id} value={att.id}>{att.name}</option>
                                                                            ))}
                                                                        </Field>
                                                                        <AttributeValueSelector attributeId={attr.name} name={`variants.${index}.variantsAttributes.${attrIndex}.value`} disabled={!attr.name} />
                                                                        <button type="button" onClick={() => attributeArrayHelpers.remove(attrIndex)} className="p-2 text-white bg-red-500 rounded">-</button>
                                                                    </div>
                                                                ))}
                                                                <button type="button" onClick={() => attributeArrayHelpers.push({ name: '', value: '' })} className="px-4 py-2 mt-2 text-white bg-blue-500 rounded">Add Attribute</button>
                                                            </div>
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                        <button type="button" onClick={() => arrayHelpers.push({ price: '', stock: '', discount_percentage: 0, image: null, variantsAttributes: [] })} className="w-full p-2 mt-4 text-white bg-green-500 rounded">Add a Product Variant</button>
                                    </div>
                                )}
                            />
                        </div>

                        <button type="submit" className="w-full p-2 mt-6 text-white bg-blue-600 rounded hover:bg-blue-700">Create Product</button>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default CreateProduct;