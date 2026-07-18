import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin } from 'lucide-react';
import { io } from 'socket.io-client';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function LiveTrackingModal({ isOpen, onClose, order }) {
  const [partnerLocation, setPartnerLocation] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !order || order.orderStatus !== 'out_for_delivery') return;

    // Set initial location from DB if available
    if (order.partnerLocation?.lat) {
      setPartnerLocation(order.partnerLocation);
    }

    const socketUrl = import.meta.env.VITE_API_URL 
      ? import.meta.env.VITE_API_URL.replace('/api/v1', '') 
      : 'http://localhost:5000';
    
    socketRef.current = io(socketUrl);
    socketRef.current.emit('join-order', order._id);
    
    socketRef.current.on('location-updated', (loc) => {
      setPartnerLocation({ lat: loc.lat, lng: loc.lng });
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [isOpen, order]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: '100%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed inset-0 z-[100] bg-white dark:bg-dark-900 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-white dark:bg-dark-800 shadow-sm z-10">
            <div>
              <h2 className="font-heading font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary-500" /> Live Tracking
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Order #{order?._id?.slice(-6).toUpperCase()}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-gray-100 dark:bg-dark-700 hover:bg-gray-200 dark:hover:bg-dark-600 rounded-full flex items-center justify-center transition-colors text-gray-700 dark:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Map Area */}
          <div className="flex-1 relative bg-gray-100 dark:bg-dark-800">
            {partnerLocation ? (
              <MapContainer 
                center={[partnerLocation.lat, partnerLocation.lng]} 
                zoom={15} 
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer 
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
                  attribution='&copy; OpenStreetMap contributors'
                />
                <Marker position={[partnerLocation.lat, partnerLocation.lng]}>
                  <Popup>Delivery Partner is here</Popup>
                </Marker>
                <MapUpdater center={[partnerLocation.lat, partnerLocation.lng]} />
              </MapContainer>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-gray-500 dark:text-gray-400">
                  <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                  <p className="font-medium">Connecting to partner GPS...</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
