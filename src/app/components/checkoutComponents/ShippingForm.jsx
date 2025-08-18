import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Truck } from "lucide-react";
import "yup-phone-lite";
export default function ShippingForm({setShippingInfo}) {
  const cities = [
    "Cairo", "Giza", "Alex", "Qalubiya",
    ];
  const initialValues = {
    name: "",
    email: "",
    phone: "",
    landmark: "",
    address: "",
    city: "",
  };
  const validation = Yup.object({
    name: Yup.string()
      .min(10, "enter name full name min 2 words,max 3 words")
      .required("full name is required"),
    email: Yup.string().email().required("Email is required"),
    phone: Yup.string()
      .phone("EG", "please enter a valid phone number")
      .required("phone number is required"),
    landmark: Yup.string().required(
      "please enter your nearest address landmark "
    ),
    address: Yup.string().required("your detailed address is required"),
    city: Yup.string().required("city is required"),
  });
  const handleSubmit = async (values) => {
    console.log(values);
setShippingInfo({
      name: values.name,
      email: values.email,
      phone: values.phone,
      city: values.city,
      landmark: values.landmark,
      address: values.address
    });
  };
  return (
    <section className="flex flex-col gap-4 rounded-lg border border-gray-300 bg-white text-[#020817] shadow-sm p-6">
      <h2 className="text-black font-bold text-xl flex items-center gap-1">
        <Truck />
        Shipping Information
      </h2>
      <Formik
        initialValues={initialValues}
        validationSchmea={validation}
        onSubmit={handleSubmit}
      >
        {() => (
          <Form className="registeration-form">
            <div className="form-input-group mb-4">
              <label className="form-label">Full name</label>
              <Field
                type="text"
                name="name"
                className="form-input"
                placeholder="enter yout full name"
              ></Field>
              
              <ErrorMessage
                name="name"
                component="div"
                className="text-red-500 text-sm"
              />
            </div>
            <div className="form-input-group mb-4">
              <label className="form-label">Email</label>
              <Field
                type="email"
                name="email"
                className="form-input"
                placeholder="Email"
              ></Field>
              
              <ErrorMessage
                name="email"
                component="div"
                className="text-red-500 text-sm"
              />
            </div>
            <div className="form-input-group mb-4">
              <label className="form-label">phone</label>
              <Field
                type="tel"
                name="phone"
                className="form-input"
                placeholder="phone number"
              ></Field>
              
              <ErrorMessage
                name="phone"
                component="div"
                className="text-red-500 text-sm"
              />
            </div>
            <div className="form-input-group mb-4">
              <label className="form-label">Landmark</label>
              <Field
                type="text"
                name="landmark"
                className="form-input"
                placeholder="nearest landmark"
              ></Field>
              
              <ErrorMessage
                name="landmark"
                component="div"
                className="text-red-500 text-sm"
              />
            </div>
            <div className="form-input-group mb-4">
              <label className="form-label">address</label>
              <Field
                type="text"
                name="address"
                className="form-input"
                placeholder="Detailed Address"
              ></Field>
              
              <ErrorMessage
                name="address"
                component="div"
                className="text-red-500 text-sm"
              />
            </div>
            <div className="form-input-group mb-4">
              <label className="form-label">City</label>
              <Field
                as="select"
                name="city"
                className="form-input"
                placeholder="City"
              >
                { cities.map((c,index)=>(<option key={index} value={c}>{c}</option>))}
              </Field>
              
              <ErrorMessage
                name="city"
                component="div"
                className="text-red-500 text-sm"
              />
            </div>
            <button type="submit" className="form-button w-full mb-2">
                Continue
            </button>
          </Form>
        )}
      </Formik>
    </section>
  );
}
