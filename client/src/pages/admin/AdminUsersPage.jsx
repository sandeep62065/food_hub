import { useState } from 'react';
import { Search, Shield, ShieldOff, ChevronLeft, ChevronRight } from 'lucide-react';
import { useGetAdminUsersQuery, useToggleBanMutation } from '../../redux/api/otherApi';
import { formatDate, getInitials } from '../../utils';
import toast from 'react-hot-toast';

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');

  const { data, isLoading } = useGetAdminUsersQuery({ page, limit: 15, search, role });
  const [toggleBan] = useToggleBanMutation();

  const users = data?.data || [];
  const pagination = data?.pagination;

  const handleBan = async (user) => {
    try {
      await toggleBan(user._id).unwrap();
      toast.success(`User ${user.isBanned ? 'unbanned' : 'banned'}`);
    } catch {
      toast.error('Action failed');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="font-heading font-bold text-2xl text-gray-900 dark:text-white">Users Management</h1>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search by name or email..." className="input pl-9 text-sm" />
        </div>
        <select value={role} onChange={e => { setRole(e.target.value); setPage(1); }} className="input text-sm min-w-[140px]">
          <option value="">All Roles</option>
          <option value="customer">Customer</option>
          <option value="owner">Owner</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-dark-700">
              <tr className="text-left text-gray-500 dark:text-gray-400">
                <th className="px-6 py-3 font-medium">User</th>
                <th className="px-6 py-3 font-medium">Role</th>
                <th className="px-6 py-3 font-medium">Phone</th>
                <th className="px-6 py-3 font-medium">Joined</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-dark-600">
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i}><td colSpan={6} className="px-6 py-4"><div className="skeleton h-4 w-full" /></td></tr>
                ))
              ) : users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-dark-700/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0 overflow-hidden">
                        {user.avatarUrl ? <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" /> : getInitials(user.name)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`badge ${user.role === 'admin' ? 'badge-danger' : user.role === 'owner' ? 'badge-warning' : 'badge-info'}`}>{user.role}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{user.phone || '-'}</td>
                  <td className="px-6 py-4 text-gray-400 text-xs">{formatDate(user.createdAt)}</td>
                  <td className="px-6 py-4">
                    <span className={`badge ${user.isBanned ? 'badge-danger' : 'badge-success'}`}>
                      {user.isBanned ? 'Banned' : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {user.role !== 'admin' && (
                      <button
                        onClick={() => handleBan(user)}
                        className={`flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${user.isBanned ? 'text-green-600 bg-green-50 hover:bg-green-100 dark:bg-green-500/10 dark:hover:bg-green-500/20' : 'text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20'}`}
                      >
                        {user.isBanned ? <><Shield className="w-3.5 h-3.5" />Unban</> : <><ShieldOff className="w-3.5 h-3.5" />Ban</>}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 dark:border-dark-600 flex items-center justify-between text-sm">
            <p className="text-gray-500">Showing {users.length} of {pagination.total}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-ghost px-3 py-1.5 text-xs disabled:opacity-40">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1.5 text-gray-700 dark:text-gray-200">Page {page} of {pagination.totalPages}</span>
              <button onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages} className="btn-ghost px-3 py-1.5 text-xs disabled:opacity-40">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

