'use client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { loadCategories, DeleteCategory, UpdateCategory, CreateCategory } from '../../utils/categoriesAPIs';
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


export default function ListCategories() {
    const queryClient = useQueryClient(); // Add this line
    useEffect(()=>{
        Modal.setAppElement('#app');
    },[]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [accessToken] = useLocalStorage('accessToken', '');
    const [selectedCategoryID,setSelectedCategoryID] = useState(null);
    const [deletedLoading, setDeletedLoading] = useState(false);
    const [deleteModalIsOpen,setDeleteModalIsOpen] = useState(false);
    const [confirmDelete,setConfirmDelete] = useState(false);
    const [deleteError,setDeleteError] = useState("");
    const [editModalIsOpen, setEditModalIsOpen] = useState(false);
    const [createModalIsOpen, setCreateModalIsOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [formData, setFormData] = useState({ name: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState("");



    const { isPending, error, data, isFetching, refetch } = useQuery({
        queryKey: ['CategoriesData', currentPage],
        queryFn: () => loadCategories({
            accessToken: accessToken,
            page: currentPage,
            pageSize: 12
        }),
        onSuccess: (data) => {
            setTotalPages(data.totalPages);
        }
    });

    useEffect(() => {
        (async () => {
            if (confirmDelete) {
                try {
                    setDeletedLoading(true);    
                    await DeleteCategory({
                        accessToken: accessToken,
                        id: selectedCategoryID
                    });
                    
                    // First update UI states
                    setDeletedLoading(false);
                    setSelectedCategoryID(null);
                    setDeleteModalIsOpen(false);
                    setConfirmDelete(false);
                    
                    // Show toast and wait for it to complete
                    await new Promise(resolve => {
                        toast.success("Category deleted successfully", {
                            onClose: resolve,
                            autoClose: 2000
                        });
                    });
                    
                    // Use refetch instead of invalidateQueries
                    await refetch();
                    
                } catch (error) {
                    setDeletedLoading(false);
                    setDeleteError("Error deleting category, try again.");
                    toast.error("Error deleting category, try again.");
                }
            }
        })();
    }, [confirmDelete, accessToken, selectedCategoryID, refetch]);
    
    const handleDelete = (categoryID) => {
        setDeleteModalIsOpen(true);
        setSelectedCategoryID(categoryID);
    }

    const handleEdit = (category) => {
        setSelectedCategory(category);
        setFormData({ name: category.name });
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
            await UpdateCategory({
                accessToken,
                id: selectedCategory.id,
                data: formData
            });
            setEditModalIsOpen(false);
            
            await new Promise(resolve => {
                toast.success("Category updated successfully", {
                    onClose: resolve,
                    autoClose: 2000
                });
            });
            
            await refetch();
        } catch (error) {
            setFormError("Error updating category. Please try again.");
            toast.error("Error updating category. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmitCreate = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFormError("");
        
        try {
            await CreateCategory({
                accessToken,
                data: formData
            });
            setCreateModalIsOpen(false);
            
            await new Promise(resolve => {
                toast.success("Category created successfully", {
                    onClose: resolve,
                    autoClose: 2000
                });
            });
            
            await refetch();
        } catch (error) {
            setFormError("Error creating category. Please try again.");
            toast.error("Error creating category. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };
    const closeDeleteModal =()=>{
        
        setDeleteModalIsOpen(false);
        setSelectedCategoryID(null);
        setConfirmDelete(false);
    };
    if (isPending) return 'Loading...';
    if (error) return 'An error has occurred: ' + error.message;
    if (isFetching) return 'Updating...';

    const categories = data?.categories || [];
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
                <p className="mb-4">Are you sure you want to delete this category?</p>
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
                contentLabel="Edit Category"
            >
                <h2 className="text-xl font-bold mb-4 text-center">Edit Category</h2>
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
                contentLabel="Create Category"
            >
                <h2 className="text-xl font-bold mb-4 text-center">Create New Category</h2>
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
                            {isSubmitting ? "Creating..." : "Create Category"}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Replace Create Link with button */}
            <button
                onClick={handleCreate}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 mb-4"
            >
                Create New Category
            </button>

            <table className="w-full bg-white rounded-lg shadow-md">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="p-3 text-left">Name</th>
                        <th className="p-3 text-left">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {categories.map((category) => (
                        <tr key={category.id} className="border-b">
                            <td className="p-3">{category.name}</td>
                            <td className="p-3 space-x-2">
                                <button
                                    onClick={() => handleEdit(category)}
                                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(category.id)}
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