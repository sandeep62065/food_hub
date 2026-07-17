import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { UtensilsCrossed, User, Mail, Lock, Phone, Eye, EyeOff, ArrowRight, ChefHat, Bike } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials, selectIsAuthenticated } from '../redux/slices/authSlice';
import { useRegisterMutation } from '../redux/api/authApi';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../utils';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  phone: z.string().optional(),
  role: z.enum(['customer', 'owner', 'delivery_partner']),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [register, { isLoading }] = useRegisterMutation();

  const { register: reg, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { role: 'customer' },
  });

  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated, navigate]);

  const selectedRole = watch('role');

  const onSubmit = async (data) => {
    const { confirmPassword, ...submitData } = data;
    try {
      const result = await register(submitData).unwrap();
      dispatch(setCredentials({ user: result.data.user, accessToken: result.data.accessToken }));
      toast.success(`Welcome to FoodieHub, ${result.data.user.name.split(' ')[0]}! 🎉`);
      if (result.data.user.role === 'owner') navigate('/owner/dashboard');
      else if (result.data.user.role === 'delivery_partner') navigate('/delivery/dashboard');
      else navigate('/');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Hero */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-dark-800 to-dark-900 items-center justify-center p-12">
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="text-center text-white max-w-sm">
          <div className="text-8xl mb-6">🍽️</div>
          <h2 className="font-heading font-extrabold text-4xl mb-4">Join the<br /><span className="text-gradient">FoodieHub</span><br />family</h2>
          <p className="text-gray-400 text-lg">Order from hundreds of restaurants, or register your own!</p>
        </motion.div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white dark:bg-dark-900 overflow-y-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md py-8">
          <Link to="/" className="flex items-center gap-2 font-heading font-bold text-xl mb-8">
            <div className="w-9 h-9 bg-gradient-primary rounded-xl flex items-center justify-center">
              <UtensilsCrossed className="w-5 h-5 text-white" />
            </div>
            <span className="text-gradient">FoodieHub</span>
          </Link>

          <h1 className="font-heading font-extrabold text-3xl text-gray-900 dark:text-white mb-2">Create account</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8">Join thousands of food lovers today</p>

          {/* Role Toggle */}
          <div className="flex gap-2 p-1 bg-gray-100 dark:bg-dark-700 rounded-xl mb-6">
            {[
              { value: 'customer', label: 'Customer', icon: User },
              { value: 'owner', label: 'Owner', icon: ChefHat },
              { value: 'delivery_partner', label: 'Delivery', icon: Bike },
            ].map(({ value, label, icon: Icon }) => (
              <label
                key={value}
                className={`flex items-center justify-center gap-2 flex-1 py-2.5 px-3 rounded-lg cursor-pointer transition-all text-sm font-medium ${
                  selectedRole === value
                    ? 'bg-white dark:bg-dark-800 text-primary-600 dark:text-primary-400 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                <input {...reg('role')} type="radio" value={value} className="hidden" />
                <Icon className="w-4 h-4" />
                {label}
              </label>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input {...reg('name')} placeholder="Your full name" className={`input pl-10 ${errors.name ? 'input-error' : ''}`} />
              </div>
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input {...reg('email')} type="email" placeholder="you@example.com" className={`input pl-10 ${errors.email ? 'input-error' : ''}`} />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label">Phone (optional)</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input {...reg('phone')} type="tel" placeholder="+91 XXXXX XXXXX" className="input pl-10" />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input {...reg('password')} type={showPassword ? 'text' : 'password'} placeholder="Min 6 characters" className={`input pl-10 pr-10 ${errors.password ? 'input-error' : ''}`} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="label">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input {...reg('confirmPassword')} type="password" placeholder="Repeat password" className={`input pl-10 ${errors.confirmPassword ? 'input-error' : ''}`} />
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full py-3 mt-2">
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>Create Account <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-500 font-semibold hover:underline">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
