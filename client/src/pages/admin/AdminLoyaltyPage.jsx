import { useState, useEffect } from 'react';
import { 
  useGetLoyaltySettingsQuery, 
  useUpdateLoyaltySettingsMutation, 
  useGetLoyaltyStatsQuery, 
  useAdjustUserPointsMutation 
} from '../../redux/api/loyaltyApi';
import { Award, Settings, TrendingUp, TrendingDown, Users, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminLoyaltyPage() {
  const { data: settingsData, isLoading: isLoadingSettings } = useGetLoyaltySettingsQuery();
  const { data: statsData, isLoading: isLoadingStats } = useGetLoyaltyStatsQuery();
  
  const [updateSettings, { isLoading: isUpdatingSettings }] = useUpdateLoyaltySettingsMutation();
  const [adjustPoints, { isLoading: isAdjusting }] = useAdjustUserPointsMutation();

  const settings = settingsData?.data;
  const stats = statsData?.data || { totalPointsIssued: 0, totalPointsRedeemed: 0 };

  const [form, setForm] = useState({ pointsPerRupee: 0, redeemRate: 0, minRedeemPoints: 0 });
  const [adjustForm, setAdjustForm] = useState({ userId: '', amount: '' });

  useEffect(() => {
    if (settings) {
      setForm({
        pointsPerRupee: settings.pointsPerRupee,
        redeemRate: settings.redeemRate,
        minRedeemPoints: settings.minRedeemPoints,
      });
    }
  }, [settings]);

  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    try {
      await updateSettings({
        pointsPerRupee: Number(form.pointsPerRupee),
        redeemRate: Number(form.redeemRate),
        minRedeemPoints: Number(form.minRedeemPoints),
      }).unwrap();
      toast.success('Loyalty settings updated');
    } catch {
      toast.error('Failed to update settings');
    }
  };

  const handleAdjustPoints = async (e) => {
    e.preventDefault();
    if (!adjustForm.userId.trim() || !adjustForm.amount) return toast.error('Fill all fields');
    try {
      await adjustPoints({ id: adjustForm.userId, amount: Number(adjustForm.amount) }).unwrap();
      toast.success('Points adjusted successfully');
      setAdjustForm({ userId: '', amount: '' });
    } catch (err) {
      toast.error(err.data?.message || 'Failed to adjust points');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-heading font-bold text-2xl text-gray-900 dark:text-white flex items-center gap-2">
            <Award className="w-6 h-6 text-yellow-500" />
            Loyalty Points Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Configure points rate and manage user balances</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-6 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-900/10 border-green-100 dark:border-green-900/30">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-500 text-white flex items-center justify-center shadow-lg shadow-green-500/30">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-green-800 dark:text-green-300">Total Points Issued</p>
              <h3 className="text-2xl font-bold font-heading text-green-900 dark:text-green-100">
                {isLoadingStats ? '...' : stats.totalPointsIssued}
              </h3>
            </div>
          </div>
        </div>
        <div className="card p-6 bg-gradient-to-br from-yellow-50 to-yellow-100/50 dark:from-yellow-900/20 dark:to-yellow-900/10 border-yellow-100 dark:border-yellow-900/30">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-500 text-white flex items-center justify-center shadow-lg shadow-yellow-500/30">
              <TrendingDown className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Total Points Redeemed</p>
              <h3 className="text-2xl font-bold font-heading text-yellow-900 dark:text-yellow-100">
                {isLoadingStats ? '...' : stats.totalPointsRedeemed}
              </h3>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settings Form */}
        <div className="card p-6">
          <h2 className="font-heading font-semibold text-lg text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary-500" />
            Global Settings
          </h2>
          {isLoadingSettings ? (
            <div className="h-40 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <form onSubmit={handleUpdateSettings} className="space-y-4">
              <div>
                <label className="label text-xs">Points per Rupee (Earning Rate)</label>
                <div className="relative">
                  <input type="number" step="0.01" value={form.pointsPerRupee} onChange={e => setForm(f => ({...f, pointsPerRupee: e.target.value}))} className="input" required />
                </div>
                <p className="text-[10px] text-gray-500 mt-1">E.g. 0.1 means 1 point for every ₹10 spent.</p>
              </div>

              <div>
                <label className="label text-xs">Redeem Rate (₹ per point)</label>
                <div className="relative">
                  <input type="number" step="0.01" value={form.redeemRate} onChange={e => setForm(f => ({...f, redeemRate: e.target.value}))} className="input" required />
                </div>
                <p className="text-[10px] text-gray-500 mt-1">E.g. 0.1 means 10 points = ₹1 discount.</p>
              </div>

              <div>
                <label className="label text-xs">Minimum Points to Redeem</label>
                <div className="relative">
                  <input type="number" value={form.minRedeemPoints} onChange={e => setForm(f => ({...f, minRedeemPoints: e.target.value}))} className="input" required />
                </div>
                <p className="text-[10px] text-gray-500 mt-1">User must have at least this many points to redeem.</p>
              </div>

              <button type="submit" disabled={isUpdatingSettings} className="btn-primary w-full mt-2">
                {isUpdatingSettings ? 'Saving...' : 'Save Settings'}
              </button>
            </form>
          )}
        </div>

        {/* Adjust User Points */}
        <div className="card p-6">
          <h2 className="font-heading font-semibold text-lg text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary-500" />
            Adjust User Balance
          </h2>
          <form onSubmit={handleAdjustPoints} className="space-y-4">
            <div>
              <label className="label text-xs">User ID</label>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Paste User MongoDB ID here" 
                  value={adjustForm.userId} 
                  onChange={e => setAdjustForm(f => ({...f, userId: e.target.value}))} 
                  className="input pl-10" 
                  required 
                />
              </div>
            </div>

            <div>
              <label className="label text-xs">Adjustment Amount</label>
              <div className="relative">
                <input 
                  type="number" 
                  placeholder="e.g. 500 or -100" 
                  value={adjustForm.amount} 
                  onChange={e => setAdjustForm(f => ({...f, amount: e.target.value}))} 
                  className="input" 
                  required 
                />
              </div>
              <p className="text-[10px] text-gray-500 mt-1">Use negative numbers to deduct points.</p>
            </div>

            <button type="submit" disabled={isAdjusting} className="btn-primary w-full mt-2 bg-yellow-500 hover:bg-yellow-600 shadow-yellow-500/30">
              {isAdjusting ? 'Processing...' : 'Adjust Points'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
