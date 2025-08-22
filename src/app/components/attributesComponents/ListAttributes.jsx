'use client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {getProductVariantAttributes ,createProductVariantAttributes ,updateProductVariantAttributes,deleteProductVariantAttributes} from '../../utils/APIs';
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


export default function ListAttributes() {
    const queryClient = useQueryClient(); // Add this line
    useEffect(()=>{
        Modal.setAppElement('#app');
    },[]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [accessToken] = useLocalStorage('accessToken', '');
    const [selectedProductAttributeID,setSelectedProductAttributeID] = useState(null);
    const [deletedLoading, setDeletedLoading] = useState(false);
    const [deleteModalIsOpen,setDeleteModalIsOpen] = useState(false);
    const [confirmDelete,setConfirmDelete] = useState(false);
    const [deleteError,setDeleteError] = useState("");
    const [editModalIsOpen, setEditModalIsOpen] = useState(false);
    const [createModalIsOpen, setCreateModalIsOpen] = useState(false);
    const [selectedProductAttribute, setSelectedProductAttribute] = useState(null);
    const [formData, setFormData] = useState({ name: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState("");



    const { isPending, error, data, isFetching, refetch } = useQuery({
        queryKey: ['AttributesData', currentPage],
        queryFn: () => getProductVariantAttributes({
            page: currentPage,
            pageSize: 12
        }),
        onSuccess: (data) => {
            setTotalPages(data.data.totalPages);
        }
    });

    

    useEffect(() => {
        (async () => {
            if (confirmDelete) {
                try {
                    setDeletedLoading(true);
                    await deleteProductVariantAttributes({
                        accessToken: accessToken,
                        id: selectedProductAttributeID
                    });
                    
                    // First update UI states
                    setDeletedLoading(false);
                    setSelectedProductAttributeID(null);
                    setDeleteModalIsOpen(false);
                    setConfirmDelete(false);
                    
                    // Show toast and wait for it to complete
                    await new Promise(resolve => {
                        toast.success("ProductAttribute deleted successfully", {
                            onClose: resolve,
                            autoClose: 2000
                        });
                    });
                    
                    // Use refetch instead of invalidateQueries
                    await refetch();
                    
                } catch (error) {
                    setDeletedLoading(false);
                    setDeleteError("Error deleting Product Attribute, try again.");
                    toast.error("Error deleting Product Attribute, try again.");
                }
            }
        })();
    }, [confirmDelete, accessToken, selectedProductAttributeID, refetch]);
    
    const handleDelete = (ProductAttributeID) => {
        setDeleteModalIsOpen(true);
        setSelectedProductAttributeID(ProductAttributeID);
    }

    const handleEdit = (ProductAttribute) => {
        setSelectedProductAttribute(ProductAttribute);
        setFormData({ name: ProductAttribute.name });
        setEditModalIsOpen(true);
    };

    const handleCreate = () => {
        setFormData({ name: '' });
        setCreateModalIsOpen(true);
    };

    const handleSubmitEdit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFormError("");
        
        try {
            await updateProductVariantAttributes({
                accessToken,
                id: selectedProductAttribute.id,
                data: formData
            });
            setEditModalIsOpen(false);
            
            await new Promise(resolve => {
                toast.success("ProductAttribute updated successfully", {
                    onClose: resolve,
                    autoClose: 2000
                });
            });
            
            await refetch();
        } catch (error) {
            setFormError("Error updating Product Attribute. Please try again.");
            toast.error("Error updating Product Attribute. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmitCreate = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFormError("");
        
        try {
            await createProductVariantAttributes({
                accessToken,
                data: formData
            });
            setCreateModalIsOpen(false);
            
            await new Promise(resolve => {
                toast.success("ProductAttribute created successfully", {
                    onClose: resolve,
                    autoClose: 2000
                });
            });
            
            await refetch();
        } catch (error) {
            setFormError("Error creating Product Attribute. Please try again.");
            toast.error("Error creating Product Attribute. Please try again.");
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
    if (isFetching) return 'Updating...';

    const productAttributes = data?.data?.productAttributes || [];
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
                <p className="mb-4">Are you sure you want to delete this Product Attribute?</p>
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
                <h2 className="text-xl font-bold mb-4 text-center">Edit ProductAttribute</h2>
                <form onSubmit={handleSubmitEdit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                            required
                        />
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
                contentLabel="Create ProductAttribute"
            >
                <h2 className="text-xl font-bold mb-4 text-center">Create New ProductAttribute</h2>
                <form onSubmit={handleSubmitCreate} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                            required
                        />
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
                            {isSubmitting ? "Creating..." : "Create ProductAttribute"}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Replace Create Link with button */}
            <button
                onClick={handleCreate}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 mb-4"
            >
                Create New ProductAttribute
            </button>

            <table className="w-full bg-white rounded-lg shadow-md">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="p-3 text-left">Name</th>
                        <th className="p-3 text-left">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {productAttributes.map((ProductAttribute) => (
                        <tr key={ProductAttribute.id} className="border-b">
                            <td className="p-3">{ProductAttribute?.name}</td>
                            <td className="p-3 space-x-2">
                                <button
                                    onClick={() => handleEdit(ProductAttribute)}
                                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(ProductAttribute.id)}
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