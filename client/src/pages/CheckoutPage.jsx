import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Plus, CreditCard, ShoppingBag, ChevronRight, Check } from 'lucide-react';
import { useSelector } from 'react-redux';
import { selectCart } from '../redux/slices/cartSlice';
import { usePlaceOrderMutation } from '../redux/api/orderApi';
import { useGetAddressesQuery, useAddAddressMutation } from '../redux/api/otherApi';
import { formatCurrency, calculateCartTotals } from '../utils';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, restaurant } = useSelector(selectCart);
  const { data: addressData } = useGetAddressesQuery();
  const [placeOrder, { isLoading }] = usePlaceOrderMutation();
  const [addAddress] = useAddAddressMutation();

  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [paymentMethod] = useState('COD');
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({ label: 'Home', street: '', city: '', state: '', pincode: '' });

  const addresses = addressData?.data || [];
  const defaultAddress = addresses.find(a => a.isDefault) || addresses[0];
  const activeAddressId = selectedAddressId || defaultAddress?._id;
  const activeAddress = addresses.find(a => a._id === activeAddressId);

  const totals = items.length > 0 ? calculateCartTotals(items, restaurant?.deliveryFee || 30) : null;

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-5xl mb-4">🛒</p>
          <h2 className="font-heading font-bold text-xl text-gray-700 dark:text-gray-200">Your cart is empty</h2>
          <button onClick={() => navigate('/restaurants')} className="btn-primary mt-6">Browse Restaurants</button>
        </div>
      </div>
    );
  }

  const handleAddNewAddress = async (e) => {
    e.preventDefault();
    if (!newAddress.street || !newAddress.city) return toast.error('Street and city are required');
    try {
      const result = await addAddress(newAddress).unwrap();
      setSelectedAddressId(result.data._id);
      setShowNewAddressForm(false);
      toast.success('Address added!');
    } catch {
      toast.error('Failed to add address');
    }
  };

  const handlePlaceOrder = async () => {
    if (!activeAddress) return toast.error('Please select a delivery address');

    try {
      await placeOrder({
        deliveryAddress: {
          label: activeAddress.label,
          street: activeAddress.street,
          city: activeAddress.city,
          state: activeAddress.state,
          pincode: activeAddress.pincode,
        },
        paymentMethod,
      }).unwrap();

      toast.success('Order placed successfully! 🎉', { duration: 4000 });
      navigate('/orders');
    } catch (err) {
      toast.error(err.data?.message || 'Failed to place order');
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container-custom max-w-6xl">
        <h1 className="font-heading font-bold text-3xl text-gray-900 dark:text-white mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left - Delivery & Payment */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <div className="card p-6">
              <h2 className="font-heading font-semibold text-xl text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary-500" />
                Delivery Address
              </h2>

              {addresses.length === 0 && !showNewAddressForm ? (
                <div className="text-center py-6">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">No saved addresses</p>
                  <button onClick={() => setShowNewAddressForm(true)} className="btn-primary text-sm">
                    <Plus className="w-4 h-4" /> Add Address
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <div
                      key={addr._id}
                      onClick={() => setSelectedAddressId(addr._id)}
                      className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        activeAddressId === addr._id
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10'
                          : 'border-gray-200 dark:border-dark-600 hover:border-primary-300'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0 ${activeAddressId === addr._id ? 'border-primary-500 bg-primary-500' : 'border-gray-300'}`}>
                        {activeAddressId === addr._id && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">{addr.label}</p>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">{addr.street}, {addr.city}, {addr.state} {addr.pincode}</p>
                      </div>
                    </div>
                  ))}

                  <button onClick={() => setShowNewAddressForm(!showNewAddressForm)} className="flex items-center gap-2 text-primary-500 text-sm font-medium hover:underline">
                    <Plus className="w-4 h-4" />
                    {showNewAddressForm ? 'Cancel' : 'Add new address'}
                  </button>
                </div>
              )}

              {/* New Address Form */}
              {showNewAddressForm && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  onSubmit={handleAddNewAddress}
                  className="mt-4 space-y-3 pt-4 border-t border-gray-200 dark:border-dark-600"
                >
                  <div className="grid grid-cols-2 gap-3">
                    {['Home', 'Work', 'Other'].map((l) => (
                      <button type="button" key={l} onClick={() => setNewAddress(a => ({...a, label: l}))}
                        className={`py-2 rounded-xl text-sm font-medium border-2 transition-all ${newAddress.label === l ? 'border-primary-500 text-primary-500 bg-primary-50 dark:bg-primary-500/10' : 'border-gray-200 dark:border-dark-600 text-gray-500'}`}
                      >{l}</button>
                    ))}
                  </div>
                  <input placeholder="Street address *" value={newAddress.street} onChange={e => setNewAddress(a => ({...a, street: e.target.value}))} className="input" required />
                  <div className="grid grid-cols-2 gap-3">
                    <input placeholder="City *" value={newAddress.city} onChange={e => setNewAddress(a => ({...a, city: e.target.value}))} className="input" required />
                    <input placeholder="State" value={newAddress.state} onChange={e => setNewAddress(a => ({...a, state: e.target.value}))} className="input" />
                  </div>
                  <input placeholder="Pincode" value={newAddress.pincode} onChange={e => setNewAddress(a => ({...a, pincode: e.target.value}))} className="input" />
                  <button type="submit" className="btn-primary text-sm py-2">Save Address</button>
                </motion.form>
              )}
            </div>

            {/* Payment */}
            <div className="card p-6">
              <h2 className="font-heading font-semibold text-xl text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary-500" />
                Payment Method
              </h2>
              <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-primary-500 bg-primary-50 dark:bg-primary-500/10">
                <div className="w-5 h-5 rounded-full border-2 border-primary-500 bg-primary-500 flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <div className="text-4xl">💵</div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">Cash on Delivery</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Pay when your order arrives</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Order Summary */}
          <div>
            <div className="card p-6 sticky top-20">
              <h2 className="font-heading font-semibold text-xl text-gray-900 dark:text-white mb-4">Order Summary</h2>

              {/* Restaurant */}
              {restaurant && (
                <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100 dark:border-dark-600">
                  <ShoppingBag className="w-4 h-4 text-primary-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{restaurant.name}</span>
                </div>
              )}

              {/* Items */}
              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={item._id} className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400 flex-1 truncate">
                      {item.food?.name} × {item.quantity}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white ml-2">{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              {totals && (
                <div className="space-y-2 pt-4 border-t border-gray-100 dark:border-dark-600 text-sm">
                  <div className="flex justify-between text-gray-500 dark:text-gray-400">
                    <span>Subtotal</span><span>{formatCurrency(totals.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500 dark:text-gray-400">
                    <span>Delivery Fee</span><span>{formatCurrency(totals.deliveryFee)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500 dark:text-gray-400">
                    <span>GST (5%)</span><span>{formatCurrency(totals.gst)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-900 dark:text-white text-base pt-2 border-t border-gray-200 dark:border-dark-600">
                    <span>Grand Total</span>
                    <span className="text-primary-500">{formatCurrency(totals.grandTotal)}</span>
                  </div>
                </div>
              )}

              <button
                onClick={handlePlaceOrder}
                disabled={isLoading || !activeAddress}
                className="btn-primary w-full py-3 mt-6 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>Place Order <ChevronRight className="w-4 h-4" /></>
                )}
              </button>

              {!activeAddress && (
                <p className="text-xs text-red-500 text-center mt-2">Please select a delivery address</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
