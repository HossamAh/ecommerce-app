import OrderSummary from '../cartComponents/OrderSummary';
export default function ReviewOrder({totalPrice,shippingFee,shippingInfo}){
    return (
        <section className="flex flex-col gap-4 rounded-lg border border-gray-300 bg-white text-[#020817] shadow-sm p-6">
            <h2 className="text-black font-bold text-xl flex items-center gap-1">
            
            Order Review
            </h2>

            <div className="space-y-4">
                <div className="flex justify-between">
                    <span>Full Name</span>
                    <span>{shippingInfo.name}</span>
                </div>
                <div className="flex justify-between">
                    <span>Email</span>
                    <span>{shippingInfo.email}</span>
                </div>
                <div className="flex justify-between">
                    <span>Phone</span>
                    <span>{shippingInfo.phone}</span>
                </div>
                <div className="flex justify-between">
                    <span>Landmark</span>
                    <span>{shippingInfo.landmark}</span>
                </div>
                <div className="flex justify-between">
                    <span>Address</span>
                    <span>{shippingInfo.address}</span>
                </div>

                <OrderSummary 
                totalPrice={totalPrice} 
                shippingFee={shippingFee} 
                cartPage={false}
                />
            </div>

        </section>
    );
}