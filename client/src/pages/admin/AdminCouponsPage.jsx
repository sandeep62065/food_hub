import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useGetCouponsQuery, useCreateCouponMutation, useUpdateCouponMutation, useDeleteCouponMutation } from '../../redux/api/couponApi';
import Modal from '../../components/Modal';
import toast from 'react-hot-toast';
import { formatDate } from '../../utils';

export default function AdminCouponsPage() {
  const { data, isLoading } = useGetCouponsQuery();
  const [createCoupon] = useCreateCouponMutation();
  const [updateCoupon] = useUpdateCouponMutation();
  const [deleteCoupon] = useDeleteCouponMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '',
    minOrderAmount: 0,
    maxDiscountAmount: '',
    expiryDate: '',
    usageLimit: '',
    isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);

  const coupons = data?.data || [];

  const openCreate = () => {
    setEditingCoupon(null);
    setFormData({
      code: '',
      discountType: 'percentage',
      discountValue: '',
      minOrderAmount: 0,
      maxDiscountAmount: '',
      expiryDate: '',
      usageLimit: '',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEdit = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderAmount: coupon.minOrderAmount,
      maxDiscountAmount: coupon.maxDiscountAmount || '',
      expiryDate: new Date(coupon.expiryDate).toISOString().split('T')[0],
      usageLimit: coupon.usageLimit || '',
      isActive: coupon.isActive,
    });
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Prepare data
    const submitData = { ...formData };
    if (!submitData.maxDiscountAmount) submitData.maxDiscountAmount = null;
    if (!submitData.usageLimit) submitData.usageLimit = null;

    try {
      if (editingCoupon) {
        await updateCoupon({ id: editingCoupon._id, data: submitData }).unwrap();
        toast.success('Coupon updated');
      } else {
        await createCoupon(submitData).unwrap();
        toast.success('Coupon created');
      }
      setIsModalOpen(false);
    } catch (err) {
      toast.error(err.data?.message || 'Action failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, code) => {
    if (!window.confirm(`Delete coupon "${code}"?`)) return;
    try {
      await deleteCoupon(id).unwrap();
      toast.success('Coupon deleted');
    } catch {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading font-bold text-2xl text-gray-900 dark:text-white">Coupons</h1>
        <button onClick={openCreate} className="btn-primary text-sm"><Plus className="w-4 h-4" />Add Coupon</button>
      </div>

      {isLoading ? (
        <div className="card p-6">
          <div className="skeleton h-10 w-full mb-4" />
          {Array(5).fill(0).map((_, i) => <div key={i} className="skeleton h-16 w-full mb-2" />)}
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-dark-800 dark:text-gray-300">
              <tr>
                <th className="px-6 py-4">Code</th>
                <th className="px-6 py-4">Discount</th>
                <th className="px-6 py-4">Min Order</th>
                <th className="px-6 py-4">Usage</th>
                <th className="px-6 py-4">Expiry</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => (
                <tr key={coupon._id} className="border-b border-gray-100 dark:border-dark-700 hover:bg-gray-50 dark:hover:bg-dark-800/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-900 dark:text-white uppercase">{coupon.code}</td>
                  <td className="px-6 py-4">
                    {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                    {coupon.discountType === 'percentage' && coupon.maxDiscountAmount && ` (Up to ₹${coupon.maxDiscountAmount})`}
                  </td>
                  <td className="px-6 py-4">₹{coupon.minOrderAmount}</td>
                  <td className="px-6 py-4">
                    {coupon.usedCount} / {coupon.usageLimit || '∞'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{formatDate(coupon.expiryDate)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${coupon.isActive ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'}`}>
                      {coupon.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEdit(coupon)} className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center hover:bg-blue-100 transition-colors text-blue-500">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(coupon._id, coupon.code)} className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-500/10 flex items-center justify-center hover:bg-red-100 transition-colors text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {coupons.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">No coupons found. Create one to get started!</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingCoupon ? 'Edit Coupon' : 'Add Coupon'} size="md">
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Coupon Code *</label>
              <input name="code" value={formData.code} onChange={handleChange} placeholder="e.g. SAVE50" className="input uppercase" required />
            </div>
            <div>
              <label className="label">Discount Type *</label>
              <select name="discountType" value={formData.discountType} onChange={handleChange} className="input" required>
                <option value="percentage">Percentage (%)</option>
                <option value="flat">Flat Amount (₹)</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Discount Value *</label>
              <input type="number" name="discountValue" value={formData.discountValue} onChange={handleChange} placeholder={formData.discountType === 'percentage' ? 'e.g. 10' : 'e.g. 100'} className="input" required min="0" />
            </div>
            <div>
              <label className="label">Min Order Amount</label>
              <input type="number" name="minOrderAmount" value={formData.minOrderAmount} onChange={handleChange} placeholder="0" className="input" min="0" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Max Discount Cap (₹)</label>
              <input type="number" name="maxDiscountAmount" value={formData.maxDiscountAmount} onChange={handleChange} placeholder="Leave empty for none" className="input" min="0" disabled={formData.discountType === 'flat'} />
            </div>
            <div>
              <label className="label">Expiry Date *</label>
              <input type="date" name="expiryDate" value={formData.expiryDate} onChange={handleChange} className="input" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Usage Limit</label>
              <input type="number" name="usageLimit" value={formData.usageLimit} onChange={handleChange} placeholder="Leave empty for unlimited" className="input" min="1" />
            </div>
            <div className="flex items-center mt-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active</span>
              </label>
            </div>
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full mt-2">
            {submitting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : editingCoupon ? 'Update Coupon' : 'Create Coupon'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
