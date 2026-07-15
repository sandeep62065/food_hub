import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useGetCategoriesQuery, useCreateCategoryMutation, useUpdateCategoryMutation, useDeleteCategoryMutation } from '../../redux/api/otherApi';
import Modal from '../../components/Modal';
import toast from 'react-hot-toast';

export default function AdminCategoriesPage() {
  const { data, isLoading } = useGetCategoriesQuery();
  const [createCategory] = useCreateCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const categories = data?.data || [];

  const openCreate = () => { setEditingCategory(null); setName(''); setIsModalOpen(true); };
  const openEdit = (cat) => { setEditingCategory(cat); setName(cat.name); setIsModalOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    const formData = new FormData();
    formData.append('name', name);

    try {
      if (editingCategory) {
        await updateCategory({ id: editingCategory._id, data: formData }).unwrap();
        toast.success('Category updated');
      } else {
        await createCategory(formData).unwrap();
        toast.success('Category created');
      }
      setIsModalOpen(false);
    } catch (err) {
      toast.error(err.data?.message || 'Action failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete category "${name}"?`)) return;
    try {
      await deleteCategory(id).unwrap();
      toast.success('Category deleted');
    } catch {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading font-bold text-2xl text-gray-900 dark:text-white">Categories</h1>
        <button onClick={openCreate} className="btn-primary text-sm"><Plus className="w-4 h-4" />Add Category</button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array(8).fill(0).map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <div key={cat._id} className="card p-4 flex flex-col items-center gap-2 group">
              <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gray-100 dark:bg-dark-700">
                <img src={cat.image || 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=100'} alt={cat.name} className="w-full h-full object-cover" />
              </div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white text-center">{cat.name}</p>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(cat)} className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center hover:bg-blue-100 transition-colors">
                  <Pencil className="w-3.5 h-3.5 text-blue-500" />
                </button>
                <button onClick={() => handleDelete(cat._id, cat.name)} className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-500/10 flex items-center justify-center hover:bg-red-100 transition-colors">
                  <Trash2 className="w-3.5 h-3.5 text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingCategory ? 'Edit Category' : 'Add Category'} size="sm">
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="label">Category Name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Pizza" className="input" required />
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : editingCategory ? 'Update' : 'Create'}
          </button>
        </form>
      </Modal>
    </div>
  );
}


