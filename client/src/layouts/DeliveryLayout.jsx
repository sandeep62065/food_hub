import { Outlet, Navigate, NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Map, LogOut, LayoutDashboard } from 'lucide-react';
import { ROLES, ROUTES } from '../constants';
import { logout } from '../redux/slices/authSlice';
import toast from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';
import PageTransition from '../components/PageTransition';

export default function DeliveryLayout() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  if (!user || user.role !== ROLES.DELIVERY_PARTNER) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Logged out successfully');
    navigate(ROUTES.HOME);
  };

  const navLinks = [
    { name: 'Dashboard', path: ROUTES.DELIVERY_DASHBOARD, icon: LayoutDashboard },
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-dark-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-dark-800 border-r border-gray-100 dark:border-dark-700 hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-100 dark:border-dark-700 flex items-center gap-3">
          <Map className="w-8 h-8 text-primary-500" />
          <span className="font-heading font-bold text-xl text-gray-900 dark:text-white">Partner App</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-500 font-medium'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-700 hover:text-gray-900 dark:hover:text-white'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                {link.name}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-dark-700">
          <div className="flex items-center gap-3 px-4 py-3 mb-2 rounded-xl bg-gray-50 dark:bg-dark-700/50">
            <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-500/20 flex items-center justify-center text-primary-600 font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white dark:bg-dark-800 border-b border-gray-100 dark:border-dark-700 h-16 flex items-center px-6 md:hidden">
           <Map className="w-6 h-6 text-primary-500 mr-2" />
           <span className="font-heading font-bold text-lg text-gray-900 dark:text-white">Partner App</span>
        </header>
        <div className="flex-1 overflow-auto p-4 md:p-8 relative flex flex-col">
          <AnimatePresence mode="wait">
            <PageTransition>
              <Outlet />
            </PageTransition>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
