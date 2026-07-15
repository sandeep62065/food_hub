import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectAuth, updateUser } from '../redux/slices/authSlice';
import { useGetMeQuery, useUpdateMeMutation, useGetAddressesQuery, useAddAddressMutation, useDeleteAddressMutation } from '../redux/api/otherApi';
import { User, Mail, Phone, MapPin, Trash2, Camera } from 'lucide-react';
import { getInitials } from '../utils';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user } = useSelector(selectAuth);
  const dispatch = useDispatch();
  
  const { data: addressData } = useGetAddressesQuery();
  const [updateMe, { isLoading: isUpdating }] = useUpdateMeMutation();
  const [addAddress] = useAddAddressMutation();
  const [deleteAddress] = useDeleteAddressMutation();

  const [form, setForm] = useState({ name: '', phone: '' });
  const [avatar, setAvatar] = useState(null);
  const [newAddress, setNewAddress] = useState({ label: 'Home', street: '', city: '', state: '', pincode: '' });
  const [showAddressForm, setShowAddressForm] = useState(false);

  const addresses = addressData?.data || [];

  useEffect(() => {
    if (user) {
      setForm({ name: user.name || '', phone: user.phone || '' });
    }
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', form.name);
    if (form.phone) formData.append('phone', form.phone);
    if (avatar) formData.append('avatar', avatar);

    try {
      const result = await updateMe(formData).unwrap();
      dispatch(updateUser(result.data));
      setAvatar(null);
      toast.success('Profile updated successfully');
    } catch {
      toast.error('Failed to update profile');
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      await addAddress(newAddress).unwrap();
      setShowAddressForm(false);
      setNewAddress({ label: 'Home', street: '', city: '', state: '', pincode: '' });
      toast.success('Address added');
    } catch {
      toast.error('Failed to add address');
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      await deleteAddress(id).unwrap();
      toast.success('Address removed');
    } catch {
      toast.error('Failed to remove address');
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container-custom max-w-5xl">
        <h1 className="font-heading font-bold text-3xl text-gray-900 dark:text-white mb-8">My Profile</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left - Profile Edit */}
          <div className="md:col-span-1 space-y-6">
            <div className="card p-6">
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="flex flex-col items-center mb-6">
                  <div className="relative w-24 h-24 rounded-full bg-gradient-primary flex items-center justify-center text-white text-2xl font-bold shadow-lg overflow-hidden group">
                    {avatar ? (
                      <img src={URL.createObjectURL(avatar)} alt="Avatar preview" className="w-full h-full object-cover" />
                    ) : user?.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      getInitials(user?.name)
                    )}
                    <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <Camera className="w-6 h-6" />
                      <input type="file" accept="image/*" onChange={e => setAvatar(e.target.files[0])} className="hidden" />
                    </label>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Click to change photo</p>
                </div>

                <div>
                  <label className="label text-xs">Email (Read Only)</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input value={user?.email || ''} readOnly className="input pl-10 bg-gray-50 dark:bg-dark-700 opacity-70" />
                  </div>
                </div>

                <div>
                  <label className="label text-xs">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} className="input pl-10" required />
                  </div>
                </div>

                <div>
                  <label className="label text-xs">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} className="input pl-10" />
                  </div>
                </div>

                <button type="submit" disabled={isUpdating} className="btn-primary w-full py-2.5 mt-2">
                  {isUpdating ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Save Changes'}
                </button>
              </form>
            </div>
          </div>

          {/* Right - Addresses */}
          <div className="md:col-span-2 space-y-6">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-heading font-semibold text-xl text-gray-900 dark:text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary-500" /> Saved Addresses
                </h2>
                <button onClick={() => setShowAddressForm(!showAddressForm)} className="btn-secondary text-sm px-4 py-1.5">
                  {showAddressForm ? 'Cancel' : 'Add New'}
                </button>
              </div>

              {showAddressForm && (
                <form onSubmit={handleAddAddress} className="mb-6 p-4 bg-gray-50 dark:bg-dark-700 rounded-xl space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {['Home', 'Work', 'Other'].map((l) => (
                      <button type="button" key={l} onClick={() => setNewAddress(a => ({...a, label: l}))}
                        className={`py-1.5 rounded-lg text-xs font-medium border-2 transition-all ${newAddress.label === l ? 'border-primary-500 text-primary-500 bg-primary-50 dark:bg-primary-500/10' : 'border-gray-200 dark:border-dark-600 text-gray-500'}`}
                      >{l}</button>
                    ))}
                  </div>
                  <input placeholder="Street address *" value={newAddress.street} onChange={e => setNewAddress(a => ({...a, street: e.target.value}))} className="input text-sm" required />
                  <div className="grid grid-cols-3 gap-3">
                    <input placeholder="City *" value={newAddress.city} onChange={e => setNewAddress(a => ({...a, city: e.target.value}))} className="input text-sm" required />
                    <input placeholder="State" value={newAddress.state} onChange={e => setNewAddress(a => ({...a, state: e.target.value}))} className="input text-sm" />
                    <input placeholder="Pincode" value={newAddress.pincode} onChange={e => setNewAddress(a => ({...a, pincode: e.target.value}))} className="input text-sm" />
                  </div>
                  <button type="submit" className="btn-primary text-sm w-full">Save Address</button>
                </form>
              )}

              {addresses.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">No saved addresses</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <div key={addr._id} className="p-4 rounded-xl border border-gray-200 dark:border-dark-600 relative group">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{addr.label}</p>
                      <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{addr.street}<br/>{addr.city}, {addr.state} {addr.pincode}</p>
                      <button onClick={() => handleDeleteAddress(addr._id)} className="absolute top-3 right-3 w-7 h-7 rounded-lg bg-red-50 dark:bg-red-500/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100">
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
