import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateRestaurantMutation } from '../../redux/api/restaurantApi';
import { Store, Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CreateRestaurantPage() {
  const navigate = useNavigate();
  const [createRestaurant, { isLoading }] = useCreateRestaurantMutation();

  const [form, setForm] = useState({
    name: '',
    description: '',
    cuisine: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    open: '10:00',
    close: '22:00',
    deliveryTime: '30-45 mins',
    deliveryFee: '40',
  });
  
  const [coverImage, setCoverImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setCoverImage(e.target.files[0]);
      setPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!coverImage) return toast.error('Please upload a cover image');

    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('description', form.description);
    // Splitting comma-separated cuisines
    form.cuisine.split(',').forEach(c => formData.append('cuisine', c.trim()));
    
    formData.append('address[street]', form.street);
    formData.append('address[city]', form.city);
    formData.append('address[state]', form.state);
    formData.append('address[pincode]', form.pincode);
    
    formData.append('openingHours[open]', form.open);
    formData.append('openingHours[close]', form.close);
    
    formData.append('estimatedDeliveryTime', form.deliveryTime);
    formData.append('deliveryFee', form.deliveryFee);
    
    formData.append('coverImage', coverImage);

    try {
      await createRestaurant(formData).unwrap();
      toast.success('Restaurant created successfully! Waiting for admin approval.');
      navigate('/owner/dashboard');
    } catch (err) {
      toast.error(err.data?.message || 'Failed to create restaurant');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pt-10">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary-100 dark:bg-primary-500/20 text-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Store className="w-8 h-8" />
        </div>
        <h1 className="font-heading font-bold text-3xl text-gray-900 dark:text-white">Register Your Restaurant</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Fill in the details to start receiving orders on FoodieHub.</p>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 md:p-8 space-y-6">
        {/* Cover Image */}
        <div>
          <label className="label">Cover Image *</label>
          {preview ? (
            <div className="relative h-48 rounded-2xl overflow-hidden border border-gray-200 dark:border-dark-600">
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => { setCoverImage(null); setPreview(null); }}
                className="absolute top-3 right-3 w-8 h-8 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-gray-300 dark:border-dark-600 rounded-2xl cursor-pointer hover:border-primary-400 transition-colors bg-gray-50 dark:bg-dark-700">
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Click to upload cover image</span>
              <span className="text-xs text-gray-400 mt-1">Recommended: 1200x800px, max 5MB</span>
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          )}
        </div>

        {/* Basic Info */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg border-b border-gray-100 dark:border-dark-600 pb-2">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Restaurant Name *</label>
              <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="e.g. Spice Route" className="input" required />
            </div>
            <div>
              <label className="label">Cuisines (comma separated) *</label>
              <input value={form.cuisine} onChange={e => setForm(f => ({...f, cuisine: e.target.value}))} placeholder="e.g. North Indian, Chinese" className="input" required />
            </div>
            <div className="md:col-span-2">
              <label className="label">Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} placeholder="Tell customers about your restaurant..." className="input h-24 resize-none" />
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg border-b border-gray-100 dark:border-dark-600 pb-2">Location</h3>
          <div>
            <label className="label">Street Address *</label>
            <input value={form.street} onChange={e => setForm(f => ({...f, street: e.target.value}))} placeholder="Shop 12, Main Street" className="input" required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">City *</label>
              <input value={form.city} onChange={e => setForm(f => ({...f, city: e.target.value}))} placeholder="Bangalore" className="input" required />
            </div>
            <div>
              <label className="label">State *</label>
              <input value={form.state} onChange={e => setForm(f => ({...f, state: e.target.value}))} placeholder="Karnataka" className="input" required />
            </div>
            <div>
              <label className="label">Pincode *</label>
              <input value={form.pincode} onChange={e => setForm(f => ({...f, pincode: e.target.value}))} placeholder="560001" className="input" required />
            </div>
          </div>
        </div>

        {/* Operations */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg border-b border-gray-100 dark:border-dark-600 pb-2">Operations</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="label">Opening Time</label>
              <input type="time" value={form.open} onChange={e => setForm(f => ({...f, open: e.target.value}))} className="input" required />
            </div>
            <div>
              <label className="label">Closing Time</label>
              <input type="time" value={form.close} onChange={e => setForm(f => ({...f, close: e.target.value}))} className="input" required />
            </div>
            <div>
              <label className="label">Delivery Time</label>
              <input value={form.deliveryTime} onChange={e => setForm(f => ({...f, deliveryTime: e.target.value}))} placeholder="e.g. 30-45 mins" className="input" required />
            </div>
            <div>
              <label className="label">Delivery Fee (₹)</label>
              <input type="number" value={form.deliveryFee} onChange={e => setForm(f => ({...f, deliveryFee: e.target.value}))} placeholder="40" className="input" required min="0" />
            </div>
          </div>
        </div>

        <button type="submit" disabled={isLoading} className="btn-primary w-full py-3 mt-4">
          {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Submit Registration'}
        </button>
      </form>
    </div>
  );
}

