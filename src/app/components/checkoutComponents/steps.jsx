
import { Check } from "lucide-react";
export default function CheckoutSteps({ currentStep,setCurrentStep }) {
  const steps = [
    {
      number: 1,
      title: "Shipping",
      description: "Enter your shipping information",
    },
    // { number: 2, title: "Payment", description: "Choose payment method" },
    { number: 2, title: "Review", description: "Review your order" },
  ];
  return (
    <section className="container mx-auto">
      <div className="flex justify-center items-center">
        {steps.map((step, index) => (
          <div key={step.number} onClick={()=>setCurrentStep(step.number)} className="flex items-center cursor-pointer">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                currentStep >= step.number
                  ? "bg-purple-600 border-purple-600 text-white"
                  : "border-gray-300 text-gray-400"
              }`}
            >
              {currentStep > step.number ? (
                <Check className="w-5 h-5" />
              ) : (
                step.number
              )}
            </div>
            <div className="ml-3 text-sm">
              <p
                className={`font-medium ${
                  currentStep >= step.number
                    ? "text-purple-600"
                    : "text-gray-400"
                }`}
              >
                {step.title}
              </p>
              <p className="text-gray-500">{step.description}</p>
            </div>

            {index < steps.length - 1 && (
              <div
                className={`mx-8 h-0.5 w-16 ${
                  currentStep > step.number ? "bg-purple-600" : "bg-gray-300"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
