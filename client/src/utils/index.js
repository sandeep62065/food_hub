export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

export const formatShortDate = (date) => {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
};

export const truncate = (str, length = 80) => {
  if (!str) return '';
  return str.length > length ? str.substring(0, length) + '...' : str;
};

export const getOrderStatusColor = (status) => {
  const colors = {
    placed: 'blue',
    confirmed: 'indigo',
    preparing: 'amber',
    out_for_delivery: 'orange',
    delivered: 'green',
    cancelled: 'red',
  };
  return colors[status] || 'gray';
};

export const getInitials = (name) => {
  if (!name) return 'U';
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
};

export const getErrorMessage = (error) => {
  return error?.data?.message || error?.message || 'Something went wrong. Please try again.';
};

export const calculateCartTotals = (items, deliveryFee = 30, gstRate = 0.05) => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const gst = Math.round(subtotal * gstRate);
  const grandTotal = subtotal + deliveryFee + gst;
  return { subtotal, gst, grandTotal, deliveryFee };
};

export const generateStars = (rating, max = 5) => {
  const stars = [];
  for (let i = 1; i <= max; i++) {
    if (i <= Math.floor(rating)) stars.push('full');
    else if (i - rating < 1 && i - rating > 0) stars.push('half');
    else stars.push('empty');
  }
  return stars;
};
