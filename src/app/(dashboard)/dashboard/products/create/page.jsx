'use client'
import CreateProduct from '../../../../components/productComponents/CreateProduct';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
export default function CreatePage(){
    const queryClient = new QueryClient();
    return (
        <>
            <h2>Create new product</h2>
            
    <QueryClientProvider client={queryClient}>
            <CreateProduct/>
            </QueryClientProvider>
        </>
    );
}