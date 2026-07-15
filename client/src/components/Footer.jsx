import { Link } from 'react-router-dom';
import { UtensilsCrossed, Globe, MessageCircle, Share2, MapPin, Phone, Mail } from 'lucide-react';
import { ROUTES } from '../constants';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-dark-800 dark:bg-dark-900 text-gray-400 mt-auto">
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to={ROUTES.HOME} className="flex items-center gap-2 font-heading font-bold text-xl mb-4">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <UtensilsCrossed className="w-4 h-4 text-white" />
              </div>
              <span className="text-white">FoodieHub</span>
            </Link>
            <p className="text-sm leading-relaxed mb-6">
              Delivering happiness, one meal at a time. Discover the best restaurants in your city.
            </p>
            <div className="flex gap-3">
              {[Globe, MessageCircle, Share2].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 bg-dark-700 hover:bg-primary-500 rounded-lg flex items-center justify-center transition-colors duration-200"
                >
                  <Icon className="w-4 h-4 text-gray-300" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold font-heading mb-4">Quick Links</h3>
            <ul className="space-y-2.5">
              {[
                { to: ROUTES.HOME, label: 'Home' },
                { to: ROUTES.RESTAURANTS, label: 'Restaurants' },
                { to: ROUTES.OFFERS, label: 'Offers' },
                { to: ROUTES.ABOUT, label: 'About Us' },
                { to: ROUTES.FAQ, label: 'FAQ' },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm hover:text-primary-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Business */}
          <div>
            <h3 className="text-white font-semibold font-heading mb-4">For Business</h3>
            <ul className="space-y-2.5">
              {[
                { to: ROUTES.REGISTER, label: 'Register Restaurant' },
                { to: ROUTES.OWNER_DASHBOARD, label: 'Owner Dashboard' },
                { to: ROUTES.CONTACT, label: 'Partner With Us' },
                { to: '#', label: 'Advertise' },
              ].map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-sm hover:text-primary-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold font-heading mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm">
                <MapPin className="w-4 h-4 text-primary-400 mt-0.5 flex-shrink-0" />
                <span>123 Tech Park, Bangalore, Karnataka 560001</span>
              </li>
              <li className="flex items-center gap-2.5 text-sm">
                <Phone className="w-4 h-4 text-primary-400 flex-shrink-0" />
                <a href="tel:+919999999999" className="hover:text-primary-400 transition-colors">+91 99999 99999</a>
              </li>
              <li className="flex items-center gap-2.5 text-sm">
                <Mail className="w-4 h-4 text-primary-400 flex-shrink-0" />
                <a href="mailto:support@foodiehub.com" className="hover:text-primary-400 transition-colors">support@foodiehub.com</a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-dark-700">
        <div className="container-custom py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
          <p>© {year} FoodieHub. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-primary-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary-400 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

