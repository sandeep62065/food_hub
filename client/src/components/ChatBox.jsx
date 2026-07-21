import { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, Minimize2 } from 'lucide-react';
import { useGetOrderMessagesQuery } from '../redux/api/chatApi';

export default function ChatBox({ orderId, socket, currentUserRole, currentUserId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  const { data, isLoading } = useGetOrderMessagesQuery(orderId, { skip: !isOpen });

  useEffect(() => {
    if (data?.data) {
      setMessages(data.data);
    }
  }, [data]);

  useEffect(() => {
    if (!socket) return;
    
    const handleReceiveMessage = (newMsg) => {
      setMessages((prev) => [...prev, newMsg]);
    };
    
    socket.on('receive_chat_message', handleReceiveMessage);
    
    return () => {
      socket.off('receive_chat_message', handleReceiveMessage);
    };
  }, [socket]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim() || !socket) return;
    
    socket.emit('send_chat_message', {
      orderId,
      message: message.trim(),
      senderRole: currentUserRole,
      senderId: currentUserId,
    });
    
    setMessage('');
  };

  const formatMessageTime = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary-500 hover:bg-primary-600 text-white rounded-full flex items-center justify-center shadow-xl transition-all z-[60] animate-bounce-slow"
      >
        <MessageSquare className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-[340px] sm:w-[380px] bg-white dark:bg-dark-800 rounded-2xl shadow-2xl z-[60] flex flex-col border border-gray-100 dark:border-dark-700 overflow-hidden" style={{ height: '500px', maxHeight: '80vh' }}>
      {/* Header */}
      <div className="bg-primary-500 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          <h3 className="font-semibold">{currentUserRole === 'customer' ? 'Delivery Partner' : 'Customer'}</h3>
        </div>
        <button onClick={() => setIsOpen(false)} className="hover:bg-primary-600 p-1.5 rounded transition-colors">
          <Minimize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-dark-900 space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-4"><div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : messages.length === 0 ? (
          <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-4">No messages yet. Say hi! 👋</div>
        ) : (
          messages.map((msg, i) => {
            const isMe = msg.senderRole === currentUserRole;
            return (
              <div key={msg._id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2 shadow-sm ${isMe ? 'bg-primary-500 text-white rounded-br-sm' : 'bg-white dark:bg-dark-700 text-gray-800 dark:text-gray-200 rounded-bl-sm border border-gray-100 dark:border-dark-600'}`}>
                  <p className="text-sm leading-relaxed">{msg.message}</p>
                  <p className={`text-[10px] mt-1 font-medium text-right ${isMe ? 'text-primary-100' : 'text-gray-400'}`}>
                    {msg.createdAt ? formatMessageTime(msg.createdAt) : formatMessageTime(new Date())}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-3 bg-white dark:bg-dark-800 border-t border-gray-100 dark:border-dark-700 flex gap-2">
        <input 
          type="text" 
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..." 
          className="flex-1 input bg-gray-50 dark:bg-dark-900 border-none rounded-full px-4 text-sm focus:ring-0"
        />
        <button type="submit" disabled={!message.trim()} className="w-10 h-10 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full flex items-center justify-center transition-colors flex-shrink-0">
          <Send className="w-4 h-4 ml-0.5" />
        </button>
      </form>
    </div>
  );
}
