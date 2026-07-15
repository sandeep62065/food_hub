import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetCategoriesQuery } from '../../redux/api/otherApi';
import { useAddFoodMutation } from '../../redux/api/foodApi';
import { useGetMyRestaurantQuery } from '../../redux/api/restaurantApi';
import { Image, Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AddFoodPage() {
  const navigate = useNavigate();
  const { data: restaurantData } = useGetMyRestaurantQuery();
  const { data: catData } = useGetCategoriesQuery();
  const [addFood, { isLoading }] = useAddFoodMutation();

  const categories = catData?.data || [];
  const restaurant = restaurantData?.data;

  const [form, setForm] = useState({
    name: '', description: '', category: '', price: '', discountPrice: '', isVeg: 'true', ingredients: '',
  });
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    setPreviews(files.map(f => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!restaurant?.isApproved) return toast.error('Your restaurant is pending approval');

    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => { if (v) formData.append(k, v); });
    images.forEach(img => formData.append('images', img));

    try {
      await addFood(formData).unwrap();
      toast.success('Food item added!');
      navigate('/owner/dashboard');
    } catch (err) {
      toast.error(err.data?.message || 'Failed to add food');
    }
  };

  if (!restaurant) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Create a restaurant first before adding food items.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="font-heading font-bold text-2xl text-gray-900 dark:text-white">Add Food Item</h1>

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        {/* Images */}
        <div>
          <label className="label">Images (up to 5)</label>
          <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 dark:border-dark-600 rounded-2xl cursor-pointer hover:border-primary-400 transition-colors">
            <Upload className="w-8 h-8 text-gray-400 mb-2" />
            <span className="text-sm text-gray-500">Click to upload food images</span>
            <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
          </label>
          {previews.length > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {previews.map((p, i) => (
                <div key={i} className="relative">
                  <img src={p} className="w-20 h-20 rounded-xl object-cover" alt="" />
                  <button type="button" onClick={() => { setPreviews(prev => prev.filter((_, j) => j !== i)); setImages(prev => prev.filter((_, j) => j !== i)); }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="label">Food Name *</label>
          <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="e.g. Margherita Pizza" className="input" required />
        </div>

        <div>
          <label className="label">Description</label>
          <textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} placeholder="Describe the dish..." className="input h-24 resize-none" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Category *</label>
            <select value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))} className="input" required>
              <option value="">Select category</option>
              {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Veg / Non-Veg</label>
            <select value={form.isVeg} onChange={e => setForm(f => ({...f, isVeg: e.target.value}))} className="input">
              <option value="true">🟢 Vegetarian</option>
              <option value="false">🔴 Non-Vegetarian</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Price (₹) *</label>
            <input type="number" value={form.price} onChange={e => setForm(f => ({...f, price: e.target.value}))} placeholder="299" className="input" required min="0" />
          </div>
          <div>
            <label className="label">Discount Price (₹)</label>
            <input type="number" value={form.discountPrice} onChange={e => setForm(f => ({...f, discountPrice: e.target.value}))} placeholder="249" className="input" min="0" />
          </div>
        </div>

        <div>
          <label className="label">Ingredients (comma-separated)</label>
          <input value={form.ingredients} onChange={e => setForm(f => ({...f, ingredients: e.target.value}))} placeholder="Cheese, Tomato, Basil" className="input" />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={isLoading} className="btn-primary flex-1">
            {isLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Add Food Item'}
          </button>
        </div>
      </form>
    </div>
  );
}

