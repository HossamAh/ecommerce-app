"use client";
import axios from "axios";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import nextConfig from "../../../../next.config.mjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {useDispatch} from 'react-redux';
import useLocalStorage from '../../utils/LocalStorage';
import {UserLogin} from '../../features/thunks/UserThunk';
export default function RegisterFrom() {
  const dispatch = useDispatch();
  const initialState = {
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    terms: false,
  };
  const validationSchema = Yup.object({
    email: Yup.string().email().required("Required"),
    password: Yup.string().required("Password is required").min(8),
  });
  const [errorState, setErrorState] = useState();
  const router = useRouter();

  const handleSubmit = async (values) => {
    console.log("on login handle submit");
    const formData = new FormData();
    formData.append("email", values.email);
    formData.append("password", values.password);

    try {
        await dispatch(UserLogin(formData));
        setTimeout(()=>router.push("/"),1000);
      
    } catch (error) {
      setErrorState("incorrect email or password.");
      console.error(error);
    }
  };
  return (
    <>
      <div className="container mx-auto p-4 pt-6 md:p-6 lg:p-12">
        <div className="flex justify-center">
          <div className="form w-full max-w-md p-4 pt-6 pb-8 mb-4 bg-white rounded shadow-md animate">
            <div className="form-header text-center mb-4">
              <h2 className="text-2xl font-bold">Login</h2>
            </div>
            <Formik
              initialValues={initialState}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({}) => (
                <Form className="registration-form">
                  <div className="form-input-group mb-4">
                    <label className="form-label">Email</label>
                    <Field
                      type="email"
                      name="email"
                      className="form-input"
                      placeholder="Email"
                    ></Field>
                    {/* <input type="text" className="form-input" placeholder="Name" /> */}
                    <ErrorMessage
                      name="email"
                      component="div"
                      className="text-red-500 text-sm"
                    />
                  </div>
                  <div className="form-input-group mb-4">
                    <label className="form-label">Password</label>
                    <Field
                      type="password"
                      name="password"
                      className="form-input"
                      placeholder="Password"
                    ></Field>
                    {/* <input type="text" className="form-input" placeholder="Name" /> */}
                    <ErrorMessage
                      name="password"
                      component="div"
                      className="text-red-500 text-sm"
                    />
                  </div>
                  <button type="submit" className="form-button w-full mb-2">
                    Login
                  </button>
                </Form>
              )}
            </Formik>
            <div className="text-center mb-4">
              <a
                href="/register"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Don't have an account? Sign up!
              </a>
            </div>
          </div>
        </div>
        {errorState && <div className="text-center mb-4">{errorState}</div>}
      </div>
    </>
  );
}
