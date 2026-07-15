import { useState } from 'react';
import { CheckCircle, XCircle, Trash2, Search, Filter } from 'lucide-react';
import { useGetAdminRestaurantsQuery, useUpdateRestaurantApprovalMutation, useDeleteRestaurantMutation } from '../../redux/api/otherApi';
import { formatDate } from '../../utils';
import toast from 'react-hot-toast';

export default function AdminRestaurantsPage() {
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const queryParams = { page, limit: 15, search, ...(filter !== '' && { isApproved: filter }) };
  const { data, isLoading } = useGetAdminRestaurantsQuery(queryParams);
  const [updateApproval] = useUpdateRestaurantApprovalMutation();
  const [deleteRestaurant] = useDeleteRestaurantMutation();

  const restaurants = data?.data || [];
  const pagination = data?.pagination;

  const handleApproval = async (id, isApproved) => {
    try {
      await updateApproval({ id, isApproved }).unwrap();
      toast.success(`Restaurant ${isApproved ? 'approved' : 'rejected'}`);
    } catch {
      toast.error('Action failed');
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete ${name} and all its foods?`)) return;
    try {
      await deleteRestaurant(id).unwrap();
      toast.success('Restaurant deleted');
    } catch {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="font-heading font-bold text-2xl text-gray-900 dark:text-white">Restaurants Management</h1>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search restaurants..." className="input pl-9 text-sm" />
        </div>
        <div className="flex gap-2">
          {[{ value: '', label: 'All' }, { value: 'false', label: 'Pending' }, { value: 'true', label: 'Approved' }].map(opt => (
            <button key={opt.value} onClick={() => { setFilter(opt.value); setPage(1); }}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${filter === opt.value ? 'bg-primary-500 text-white border-primary-500' : 'border-gray-200 dark:border-dark-600 text-gray-600 dark:text-gray-300 hover:border-primary-300'}`}
            >{opt.label}</button>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-dark-700">
              <tr className="text-left text-gray-500 dark:text-gray-400">
                <th className="px-6 py-3 font-medium">Restaurant</th>
                <th className="px-6 py-3 font-medium">Owner</th>
                <th className="px-6 py-3 font-medium">City</th>
                <th className="px-6 py-3 font-medium">Rating</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-dark-600">
              {isLoading ? (
                Array(5).fill(0).map((_, i) => <tr key={i}><td colSpan={6} className="px-6 py-4"><div className="skeleton h-4 w-full" /></td></tr>)
              ) : restaurants.map((r) => (
                <tr key={r._id} className="hover:bg-gray-50 dark:hover:bg-dark-700/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={r.coverImage || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=100'} alt="" className="w-10 h-10 rounded-xl object-cover" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{r.name}</p>
                        <p className="text-xs text-gray-400">{r.cuisine?.join(', ')}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{r.owner?.name || '-'}</td>
                  <td className="px-6 py-4 text-gray-500">{r.address?.city}</td>
                  <td className="px-6 py-4 text-amber-500">⭐ {r.avgRating?.toFixed(1) || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`badge ${r.isApproved ? 'badge-success' : 'badge-warning'}`}>
                      {r.isApproved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {!r.isApproved ? (
                        <button onClick={() => handleApproval(r._id, true)} className="flex items-center gap-1 text-xs text-green-600 bg-green-50 dark:bg-green-500/10 px-3 py-1.5 rounded-lg hover:bg-green-100 transition-colors">
                          <CheckCircle className="w-3.5 h-3.5" />Approve
                        </button>
                      ) : (
                        <button onClick={() => handleApproval(r._id, false)} className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 dark:bg-amber-500/10 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-colors">
                          <XCircle className="w-3.5 h-3.5" />Revoke
                        </button>
                      )}
                      <button onClick={() => handleDelete(r._id, r.name)} className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-500/10 flex items-center justify-center hover:bg-red-100 transition-colors">
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

