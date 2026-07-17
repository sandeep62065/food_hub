import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetMyDeliveriesQuery, useUpdateDeliveryOrderStatusMutation } from '../../redux/api/deliveryApi';
import { io } from 'socket.io-client';
import { MapPin, Navigation, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
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

// Component to dynamically update map center
function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function ActiveDeliveryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useGetMyDeliveriesQuery();
  const [updateStatus, { isLoading: isUpdating }] = useUpdateDeliveryOrderStatusMutation();

  const [currentLocation, setCurrentLocation] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const watchIdRef = useRef(null);
  const socketRef = useRef(null);

  const order = data?.data?.find(o => o._id === id);

  useEffect(() => {
    if (order && order.orderStatus === 'out_for_delivery') {
      startTracking();
    }
    return () => stopTracking();
  }, [order?.orderStatus]);

  const startTracking = () => {
    if (isTracking) return;
    
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    const socketUrl = import.meta.env.VITE_API_URL 
      ? import.meta.env.VITE_API_URL.replace('/api/v1', '') 
      : 'http://localhost:5000';
    
    socketRef.current = io(socketUrl);
    socketRef.current.emit('join-order', id);

    setIsTracking(true);
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        setCurrentLocation({ lat, lng });
        socketRef.current.emit('update-location', { orderId: id, lat, lng });
      },
      (error) => {
        console.error('Error tracking location', error);
        toast.error('Failed to get location. Please enable GPS.');
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
    );
  };

  const stopTracking = () => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    setIsTracking(false);
  };

  const handleUpdateStatus = async (status) => {
    try {
      await updateStatus({ id, status }).unwrap();
      toast.success(`Order marked as ${status.replace('_', ' ')}`);
      if (status === 'delivered') {
        stopTracking();
        navigate('/delivery/dashboard');
      }
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update status');
    }
  };

  if (isLoading) return <div className="flex justify-center p-8"><div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!order) return <div className="p-8 text-center">Order not found or not assigned to you.</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto h-[calc(100vh-100px)] flex flex-col">
      <div className="flex justify-between items-center bg-white dark:bg-dark-800 p-4 rounded-xl border border-gray-100 dark:border-dark-700">
        <div>
          <h1 className="font-heading font-bold text-xl text-gray-900 dark:text-white">Active Delivery</h1>
          <p className="text-sm text-gray-500">#{order._id.slice(-6).toUpperCase()}</p>
        </div>
        <div className="flex gap-2">
          {order.orderStatus === 'preparing' && (
            <button 
              onClick={() => handleUpdateStatus('out_for_delivery')} 
              disabled={isUpdating}
              className="btn-primary flex items-center gap-2"
            >
              <Navigation className="w-4 h-4" /> Start Delivery
            </button>
          )}
          {order.orderStatus === 'out_for_delivery' && (
            <button 
              onClick={() => handleUpdateStatus('delivered')} 
              disabled={isUpdating}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" /> Mark Delivered
            </button>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 flex-1 min-h-0">
        <div className="md:col-span-1 space-y-4 overflow-y-auto pr-2">
          <div className="card p-5">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Pickup</h3>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{order.restaurant?.name}</p>
                <p className="text-sm text-gray-500">{order.restaurant?.address?.street}, {order.restaurant?.address?.city}</p>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Dropoff</h3>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{order.user?.name}</p>
                <p className="text-sm text-gray-500">{order.deliveryAddress?.street}, {order.deliveryAddress?.city}</p>
                <p className="text-sm text-gray-500 mt-1">Phone: {order.user?.phone || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Tracking Status</h3>
            {isTracking ? (
              <div className="flex items-center gap-2 text-green-500 text-sm font-medium">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                Live GPS Active
              </div>
            ) : (
              <div className="text-gray-500 text-sm">
                Tracking will start when you mark order as "Out for Delivery".
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-2 card overflow-hidden relative min-h-[300px]">
          {/* A simple map placeholder if no coordinates yet. In real app, you'd geocode addresses */}
          {currentLocation ? (
            <MapContainer center={[currentLocation.lat, currentLocation.lng]} zoom={15} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={[currentLocation.lat, currentLocation.lng]}>
                <Popup>You are here</Popup>
              </Marker>
              <MapUpdater center={[currentLocation.lat, currentLocation.lng]} />
            </MapContainer>
          ) : (
            <div className="absolute inset-0 bg-gray-100 dark:bg-dark-700 flex items-center justify-center">
              <p className="text-gray-500">Map will appear when GPS location is acquired.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
