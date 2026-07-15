import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectAuth, logout } from '../redux/slices/authSlice';
import { LayoutDashboard, UtensilsCrossed, ShoppingBag, Star, PlusCircle, Menu, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLogoutMutation } from '../redux/api/authApi';

const NAV_ITEMS = [
  { to: '/owner/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/owner/foods/add', label: 'Add Food', icon: PlusCircle },
  { to: '/owner/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/owner/reviews', label: 'Reviews', icon: Star },
];

function OwnerSidebar({ isOpen, onClose }) {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(selectAuth);
  const [logoutMutation] = useLogoutMutation();

  const handleLogout = async () => {
    try { await logoutMutation().unwrap(); } catch {}
    dispatch(logout());
    navigate('/');
  };

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={onClose} />}
      <aside className={`fixed top-0 left-0 bottom-0 z-30 w-64 bg-dark-800 flex flex-col transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 border-b border-dark-600">
          <Link to="/" className="flex items-center gap-2 text-white font-heading font-bold text-lg">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
            <span>FoodieHub</span>
          </Link>
          <p className="text-xs text-gray-500 mt-1 ml-10">Owner Panel</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                location.pathname === to ? 'bg-primary-500 text-white shadow-glow' : 'text-gray-400 hover:text-white hover:bg-dark-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-dark-600">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white text-xs font-bold">O</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors">
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

export default function OwnerLayout() {
  const { isAuthenticated, user } = useSelector(selectAuth);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'owner') return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex">
      <OwnerSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        <header className="sticky top-0 z-10 bg-white/90 dark:bg-dark-800/90 backdrop-blur-xl border-b border-gray-200 dark:border-dark-600 h-16 flex items-center px-4 sm:px-6">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden btn-ghost w-9 h-9 p-0 rounded-lg">
            <Menu className="w-4 h-4" />
          </button>
        </header>
        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
