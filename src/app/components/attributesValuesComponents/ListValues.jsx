'use client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {getProductVariantAttributes,getProductVariantAttributesValue ,createProductVariantAttributesValue ,updateProductVariantAttributesValue,deleteProductVariantAttributesValue} from '../../utils/APIs';
import useLocalStorage from '../../utils/LocalStorage';
import { useEffect, useState } from "react";
import Link from 'next/link';
import Modal from 'react-modal';
import { ToastContainer,toast } from 'react-toastify';

const modalStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    minWidth: '400px',
  },
};


export default function ListValues() {
    const queryClient = useQueryClient(); // Add this line
    useEffect(()=>{
        Modal.setAppElement('#app');
    },[]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [accessToken] = useLocalStorage('accessToken', '');
    const [selectedProductAttributeValueID,setSelectedProductAttributeValueID] = useState(null);
    const [deletedLoading, setDeletedLoading] = useState(false);
    const [deleteModalIsOpen,setDeleteModalIsOpen] = useState(false);
    const [confirmDelete,setConfirmDelete] = useState(false);
    const [deleteError,setDeleteError] = useState("");
    const [editModalIsOpen, setEditModalIsOpen] = useState(false);
    const [createModalIsOpen, setCreateModalIsOpen] = useState(false);
    const [selectedProductAttributeValue, setSelectedProductAttributeValue] = useState(null);
    const [formData, setFormData] = useState({
        value: '',
        code: '',
        ProductAttributeId: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState("");
    // const [productAttributes,setProductAttributes]= useState([]);



    const { isPending, error, data, isFetching, refetch } = useQuery({
        queryKey: ['AttributesValueData', currentPage],
        queryFn: () => getProductVariantAttributesValue({
            page: currentPage,
            pageSize: 12
        }),
        onSuccess: (data) => {
            setTotalPages(data.data.totalPages);
        }
    });
    const { data: AttributesData, isPending: isFetchingAttributes } = useQuery({
        queryKey: ['AttributesData'],
        queryFn: () => getProductVariantAttributes({
            page: 1,
            pageSize: 100
        })
    });

    

    useEffect(() => {
        (async () => {
            if (confirmDelete) {
                try {
                    setDeletedLoading(true);
                    await deleteProductVariantAttributesValue({
                        accessToken: accessToken,
                        id: selectedProductAttributeValueID
                    });
                    
                    // First update UI states
                    setDeletedLoading(false);
                    setSelectedProductAttributeValueID(null);
                    setDeleteModalIsOpen(false);
                    setConfirmDelete(false);
                    
                    // Show toast and wait for it to complete
                    await new Promise(resolve => {
                        toast.success("Product Attribute Value deleted successfully", {
                            onClose: resolve,
                            autoClose: 2000
                        });
                    });
                    
                    // Use refetch instead of invalidateQueries
                    await refetch();
                    
                } catch (error) {
                    setDeletedLoading(false);
                    setDeleteError("Error deleting Product Attribute Value, try again.");
                    toast.error("Error deleting Product Attribute Value, try again.");
                }
            }
        })();
    }, [confirmDelete, accessToken, selectedProductAttributeValueID, refetch]);
    
    const handleDelete = (ProductAttributeValueID) => {
        setDeleteModalIsOpen(true);
        setSelectedProductAttributeValueID(ProductAttributeValueID);
    }

    const handleEdit = (ProductAttributeValue) => {
        setSelectedProductAttributeValue(ProductAttributeValue);
        setFormData({ value: ProductAttributeValue.value,code:ProductAttributeValue.code,ProductAttributeId:ProductAttributeValue.ProductAttributeId });
        setEditModalIsOpen(true);
    };

    const handleCreate = () => {
        setFormData({ value: '',code:'',ProductAttributeId:'' });
        setCreateModalIsOpen(true);
    };

    const handleSubmitEdit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFormError("");
        
        try {
            await updateProductVariantAttributesValue({
                accessToken,
                id: selectedProductAttributeValue.id,
                data: formData
            });
            setEditModalIsOpen(false);
            
            await new Promise(resolve => {
                toast.success("Product Attribute Value updated successfully", {
                    onClose: resolve,
                    autoClose: 2000
                });
            });
            
            await refetch();
        } catch (error) {
            setFormError("Error updating Product Attribute Value. Please try again.");
            toast.error("Error updating Product Attribute Value. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmitCreate = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFormError("");
        
        try {
            await createProductVariantAttributesValue({
                accessToken,
                data: formData
            });
            setCreateModalIsOpen(false);
            
            await new Promise(resolve => {
                toast.success("Product Attribute Value created successfully", {
                    onClose: resolve,
                    autoClose: 2000
                });
            });
            
            await refetch();
        } catch (error) {
            setFormError("Error creating Product Attribute Value. Please try again.");
            toast.error("Error creating Product Attribute Value. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };
    const closeDeleteModal =()=>{
        
        setDeleteModalIsOpen(false);
        setSelectedProductAttributeID(null);
        setConfirmDelete(false);
    };
    if (isPending) return 'Loading...';
    if (error) return 'An error has occurred: ' + error.message;
    if (isFetching && isFetchingAttributes ) return 'Updating...';

    const productAttributesValues = data?.data?.productAttributesValues || [];
    const productAttributes = AttributesData?.data?.productAttributes || [];
    return (
        <>

            <ToastContainer/>
            {/* delete modal */}
            <Modal
                isOpen={deleteModalIsOpen}
                onRequestClose={()=>closeDeleteModal()}
                style={modalStyles}
                contentLabel="Delete confirmation"
            >
                <h2 className="text-xl font-bold mb-4 text-center">Confirm Deletion</h2>
                <p className="mb-4">Are you sure you want to delete this Product Attribute Value ?</p>
                {deleteError!=="" && <p className="text-red-500">{deleteError}</p>}

                <div className="flex justify-between items-center ">
                    <button className="bg-gray-500 rounded-xl p-4 hover:bg-gray-300" onClick={()=>closeDeleteModal()}>
                        Cancel
                    </button>
                    <button className="bg-red-500 rounded-xl p-4 hover:bg-red-300" onClick={()=>setConfirmDelete(true)}>
                        {deletedLoading?"Deleting..." :"Delete"}
                    </button>
                </div>
            </Modal>


            {/* Edit Modal */}
            <Modal
                isOpen={editModalIsOpen}
                onRequestClose={() => setEditModalIsOpen(false)}
                style={modalStyles}
                contentLabel="Edit ProductAttribute"
            >
                <h2 className="text-xl font-bold mb-4 text-center">Edit ProductAttribute Value</h2>
                <form onSubmit={handleSubmitEdit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">value</label>
                        <input
                            type="text"
                            value={formData.value}
                            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Code</label>
                        <input
                            type="text"
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Product Attribute</label>
                        <select
                            value={formData.ProductAttributeId}
                            onChange={(e) => setFormData({ ...formData, ProductAttributeId: e.target.value })}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                            required
                        >
                            <option value="">Select an attribute</option>
                            {productAttributes && productAttributes.length > 0 && 
                                productAttributes.map(attribute => (
                                    <option key={attribute.id} value={attribute.id}>
                                        {attribute.name}
                                    </option>
                                ))
                            }
                        </select>
                    </div>
                    {formError && <p className="text-red-500">{formError}</p>}
                    <div className="flex justify-between items-center">
                        <button 
                            type="button"
                            onClick={() => setEditModalIsOpen(false)}
                            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Create Modal */}
            <Modal
                isOpen={createModalIsOpen}
                onRequestClose={() => setCreateModalIsOpen(false)}
                style={modalStyles}
                contentLabel="Create Product Attribute Value"
            >
                <h2 className="text-xl font-bold mb-4 text-center">Create New Product Attribute Value </h2>
                <form onSubmit={handleSubmitCreate} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">value</label>
                        <input
                            type="text"
                            value={formData.value}
                            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">code</label>
                        <input
                            type="text"
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Product Attribute</label>
                        <select
                            value={formData.ProductAttributeId}
                            onChange={(e) => setFormData({ ...formData, ProductAttributeId: e.target.value })}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                            required
                        >
                            <option value="">Select an attribute</option>
                            {productAttributes && productAttributes.length > 0 && 
                                productAttributes.map(attribute => (
                                    <option key={attribute.id} value={attribute.id}>
                                        {attribute.name}
                                    </option>
                                ))
                            }
                        </select>
                    </div>
                    {formError && <p className="text-red-500">{formError}</p>}
                    <div className="flex justify-between items-center">
                        <button 
                            type="button"
                            onClick={() => setCreateModalIsOpen(false)}
                            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Creating..." : "Create Product Attribute Value"}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Replace Create Link with button */}
            <button
                onClick={handleCreate}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 mb-4"
            >
                Create New Product Attribute Value
            </button>

            <table className="w-full bg-white rounded-lg shadow-md">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="p-3 text-left">Name</th>
                        <th className="p-3 text-left">Code</th>
                        <th className="p-3 text-left">Attribute</th>
                        <th className="p-3 text-left">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {productAttributesValues.map((ProductAttributeValue) => (
                        <tr key={ProductAttributeValue.id} className="border-b">
                            <td className="p-3">{ProductAttributeValue?.value}</td>
                            <td className="p-3">{ProductAttributeValue?.code}</td>
                            <td className="p-3">{ProductAttributeValue?.ProductAttribute?.name}</td>
                            <td className="p-3 space-x-2">
                                <button
                                    onClick={() => handleEdit(ProductAttributeValue)}
                                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(ProductAttributeValue.id)}
                                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="flex justify-center my-8">
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 mr-2 bg-blue-500 text-white rounded cursor-pointer disabled:bg-gray-300"
                >
                    Previous
                </button>
                <span className="px-4 py-2 bg-gray-200 rounded">{currentPage}</span>
                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className="px-4 py-2 ml-2 bg-blue-500 text-white rounded cursor-pointer disabled:bg-gray-300"
                >
                    Next
                </button>
            </div>
        </>
    );
}