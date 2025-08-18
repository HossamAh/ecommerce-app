'use client'
import EditProduct from '../../../../../components/productComponents/EditProduct';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import {use} from 'react';
export default function CreatePage({params}){
    const queryClient = new QueryClient();
    const resolvedParams= use(params);
    const productId = resolvedParams.productID;
    return (
        <>
            <h2>Edit product</h2>
            
    <QueryClientProvider client={queryClient}>
            <EditProduct productId={productId}/>
            </QueryClientProvider>
        </>
    );
}