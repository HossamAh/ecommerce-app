'use client';
import React, { useState } from 'react';
import axios from 'axios';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { useRouter } from "next/navigation";

const CreateCategory = () => {
    const router = useRouter();
    const initialValues = {
        name: ''
    };

    const validationSchema = Yup.object({
        name: Yup.string().required('Required'),
    });


    const handleSubmit = async (values) => {
        const formData = new FormData();
        formData.append('name', values.name);
        try {
            await axios.post('http://localhost:5000/api/categories', formData, {withCredentials:true,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            router.push('/admin/categories');
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="p-6">
            <h1 className="mb-6 text-3xl font-bold">Create Product</h1>
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {
                ({ setFieldValue }) => (
                    <Form>
                        <div className="mb-4">
                            <label className="block mb-2 text-sm font-medium">Name</label>
                            <Field
                                name="name"
                                type="text"
                                className="w-full p-2 border rounded"
                            />
                            <ErrorMessage name="name" component="div" className="text-sm text-red-500" />
                        </div>
                        <button type="submit" className="w-full p-2 text-white bg-blue-500 rounded hover:bg-blue-600">
                            Create Category
                        </button>

                        
                      
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default CreateCategory;