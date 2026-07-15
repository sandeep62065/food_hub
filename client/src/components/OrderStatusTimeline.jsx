import { Check, Clock } from 'lucide-react';
import { ORDER_STATUSES } from '../constants';

const STATUS_ORDER = ['placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];

export default function OrderStatusTimeline({ status, statusHistory = [] }) {
  const isCancelled = status === 'cancelled';
  const currentIndex = STATUS_ORDER.indexOf(status);

  return (
    <div className="space-y-1">
      {isCancelled ? (
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-500/10 rounded-xl border border-red-100 dark:border-red-500/20">
          <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center">
            <span className="text-xl">{ORDER_STATUSES.cancelled.icon}</span>
          </div>
          <div>
            <p className="font-semibold text-red-700 dark:text-red-400">Order Cancelled</p>
            {statusHistory.find(s => s.status === 'cancelled')?.note && (
              <p className="text-sm text-red-500 dark:text-red-400/80">
                {statusHistory.find(s => s.status === 'cancelled').note}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="relative">
          {/* Connecting Line */}
          <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-gray-200 dark:bg-dark-600" />
          <div
            className="absolute left-5 top-5 w-0.5 bg-primary-500 transition-all duration-700"
            style={{ height: currentIndex >= 0 ? `${(currentIndex / (STATUS_ORDER.length - 1)) * 100}%` : '0%' }}
          />

          <div className="space-y-4">
            {STATUS_ORDER.map((s, idx) => {
              const isCompleted = currentIndex >= idx;
              const isCurrent = currentIndex === idx;
              const info = ORDER_STATUSES[s];
              const historyItem = statusHistory.find(h => h.status === s);

              return (
                <div key={s} className="flex items-start gap-4 relative">
                  {/* Icon */}
                  <div
                    className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                      isCompleted
                        ? 'bg-primary-500 text-white shadow-glow'
                        : 'bg-gray-100 dark:bg-dark-700 text-gray-400'
                    } ${isCurrent ? 'ring-4 ring-primary-200 dark:ring-primary-500/30' : ''}`}
                  >
                    {isCompleted ? (
                      idx < currentIndex ? <Check className="w-4 h-4" /> : <span className="text-base">{info.icon}</span>
                    ) : (
                      <span className="text-base opacity-40">{info.icon}</span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-4">
                    <p className={`font-semibold text-sm ${isCompleted ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>
                      {info.label}
                    </p>
                    {historyItem && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {new Date(historyItem.timestamp).toLocaleString('en-IN')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
