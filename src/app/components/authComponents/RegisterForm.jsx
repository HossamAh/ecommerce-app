'use client'
import axios from 'axios';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import nextConfig from '../../../../next.config.mjs';
import { useRouter } from 'next/navigation';
import {useState} from 'react';
export default function RegisterFrom(){
    const initialState = {
        'name':"",
        'email':"",
        "password":"",
        "confirmPassword":"",
        "terms":false,
    };
    const [errorState,setErrorState] = useState();
    const validationSchema = Yup.object({
        name: Yup.string().required('Required').min(3),
        email: Yup.string().email().required('Required'),
        password: Yup.string().required('Password is required').min(8),
        confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match'),
        terms: Yup.boolean().oneOf([true],'You must accept the terms and conditions')
    });

    const router = useRouter();
    const handleSubmit = async (values) => {
        const formData = new FormData();
        formData.append('name', values.name);
        formData.append('email', values.email);
        formData.append('password', values.password);
        
        try {
            await axios.post(nextConfig.env.API_URL+'/api/auth/register', formData);
            // navigate('/login');
            router.push('/login');
        } catch (error) {
            setErrorState("error in registering ,please try again.");
            console.error(error);
        }
    };
    return(
    <>
    <div className="container mx-auto p-4 pt-6 md:p-6 lg:p-12">
        <div className="flex justify-center">
            <div className="form w-full max-w-md p-4 pt-6 pb-8 mb-4 bg-white rounded shadow-md animate">
                <div className="form-header text-center mb-4">
                    <h2 className="text-2xl font-bold">Register</h2>
                </div>
                <Formik
                    initialValues={initialState}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                >
                    {({})=>(
                        <Form className="registration-form">
                        <div className="form-input-group mb-4">
                            <label className="form-label">Name</label>
                            <Field type="text" name="name" className="form-input" placeholder="Name"></Field>
                            {/* <input type="text" className="form-input" placeholder="Name" /> */}
                            <ErrorMessage name="name" component="div" className="text-red-500 text-sm" />
                        </div>                            
                        <div className="form-input-group mb-4">
                            <label className="form-label">Email</label>
                            <Field type="email" name="email" className="form-input" placeholder="Email"></Field>
                            {/* <input type="text" className="form-input" placeholder="Name" /> */}
                            <ErrorMessage name="email" component="div" className="text-red-500 text-sm" />
                        </div>                            
                        <div className="form-input-group mb-4">
                            <label className="form-label">Password</label>
                            <Field type="password" name="password" className="form-input" placeholder="Password"></Field>
                            {/* <input type="text" className="form-input" placeholder="Name" /> */}
                            <ErrorMessage name="password" component="div" className="text-red-500 text-sm" />
                        </div>                            
                        <div className="form-input-group mb-4">
                            <label className="form-label">Confirm Password</label>
                            <Field type="password" name="confirmPassword" className="form-input" placeholder="Confirm Password"></Field>
                            {/* <input type="text" className="form-input" placeholder="Name" /> */}
                            <ErrorMessage name="confirmPassword" component="div" className="text-red-500 text-sm" />
                        </div>    
                        <div className="terms-checkbox mb-4">
                        <Field type="checkbox" name="terms" id="terms" className="form-checkbox" />
                        <label htmlFor="terms" >
                            I agree to the terms and conditions
                        </label>
                        {/* <input type="checkbox" id="terms" /> */}
                        <ErrorMessage name="terms" component="div" className="text-red-500 text-sm" />
                        </div>   
                        <button type="submit" className="form-button w-full mb-2">Register</button>
                        
                                   
                        </Form>
                    )}

                </Formik>
                <div className="text-center mb-4">
                    <a href="/login" className="text-sm text-gray-600 hover:text-gray-900">Already have an account? Login!</a>
                </div>
            </div>
        </div>
        {errorState && 
        (
            <div className="text-center mb-4">
                {errorState}
            </div>
        )
        }
    </div>
    </>
    );
}