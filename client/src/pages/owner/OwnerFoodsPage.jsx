import { useState } from 'react';
import { Trash2, Search, Edit } from 'lucide-react';
import { useGetOwnerFoodsQuery, useDeleteFoodMutation } from '../../redux/api/foodApi';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils';
import toast from 'react-hot-toast';

export default function OwnerFoodsPage() {
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  
  const queryParams = { search, ...(filter !== '' && { isAvailable: filter }) };
  const { data, isLoading } = useGetOwnerFoodsQuery(queryParams);
  const [deleteFood] = useDeleteFoodMutation();

  const foods = data?.data || [];

  const handleDelete = async (id, name) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await deleteFood(id).unwrap();
      toast.success('Food deleted successfully');
    } catch {
      toast.error('Failed to delete food');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="font-heading font-bold text-2xl text-gray-900 dark:text-white">My Food Items</h1>

      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex gap-3 flex-wrap flex-1">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              placeholder="Search my foods..." 
              className="input pl-9 text-sm" 
            />
          </div>
          <div className="flex gap-2">
            {[{ value: '', label: 'All' }, { value: 'true', label: 'Available' }, { value: 'false', label: 'Unavailable' }].map(opt => (
              <button 
                key={opt.value} 
                onClick={() => setFilter(opt.value)}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${filter === opt.value ? 'bg-primary-500 text-white border-primary-500' : 'border-gray-200 dark:border-dark-600 text-gray-600 dark:text-gray-300 hover:border-primary-300'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <Link to="/owner/foods/add" className="btn-primary py-2 px-4 text-sm">
          Add New Food
        </Link>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-dark-700">
              <tr className="text-left text-gray-500 dark:text-gray-400">
                <th className="px-6 py-3 font-medium">Food Item</th>
                <th className="px-6 py-3 font-medium">Category</th>
                <th className="px-6 py-3 font-medium">Price</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-dark-600">
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i}><td colSpan={5} className="px-6 py-4"><div className="skeleton h-4 w-full" /></td></tr>
                ))
              ) : foods.map((food) => (
                <tr key={food._id} className="hover:bg-gray-50 dark:hover:bg-dark-700/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={food.images?.[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100'} 
                        alt={food.name} 
                        className="w-10 h-10 rounded-xl object-cover" 
                      />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{food.name}</p>
                        {food.isVeg && <span className="text-xs text-green-500 font-medium">Veg</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{food.category?.name || '-'}</td>
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                    {formatCurrency(food.discountPrice || food.price)}
                    {food.discountPrice && <span className="text-xs line-through text-gray-400 ml-2">{formatCurrency(food.price)}</span>}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`badge ${food.isAvailable ? 'badge-success' : 'badge-neutral'}`}>
                      {food.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleDelete(food._id, food.name)} 
                        className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-500/10 flex items-center justify-center hover:bg-red-100 transition-colors"
                        title="Delete Food"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && foods.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No food items found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
