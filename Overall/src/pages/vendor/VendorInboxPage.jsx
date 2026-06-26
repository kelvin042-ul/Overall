import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase/config';
import { collection, query, where, getDocs, addDoc, onSnapshot, orderBy, updateDoc, doc } from 'firebase/firestore';
import { supabase } from '../../lib/supabase';
import { FiMessageCircle, FiSend, FiCheckCircle } from 'react-icons/fi';
import VendorLayout from '../../components/VendorLayout';
import toast from 'react-hot-toast';

const VendorInboxPage = () => {
    const navigate = useNavigate();
    const [vendor, setVendor] = useState(null);
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [messagesLoading, setMessagesLoading] = useState(false);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            navigate('/vendor/login');
            return;
        }
        await loadVendor(session.user.id);
    };

    const loadVendor = async (authId) => {
        try {
            const { data, error } = await supabase
                .from('vendors')
                .select('*')
                .eq('auth_id', authId)
                .single();

            if (error) throw error;
            setVendor(data);
            await loadChats(data.id);
        } catch (error) {
            console.error("Failed to load vendor:", error);
            toast.error('Failed to load vendor');
            setLoading(false);
        }
    };

    const loadChats = async (vendorId) => {
        try {
            const chatsRef = collection(db, 'chats');
            const q = query(chatsRef, where('vendorId', '==', vendorId));
            const querySnapshot = await getDocs(q);

            const chatsData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setChats(chatsData);
        } catch (error) {
            console.error("Error loading chats:", error);
        } finally {
            setLoading(false);
        }
    };

    const loadMessages = (chatId) => {
        setMessagesLoading(true);
        const messagesRef = collection(db, 'chats', chatId, 'messages');
        const q = query(messagesRef, orderBy('createdAt', 'asc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const messagesData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setMessages(messagesData);
            setMessagesLoading(false);
        }, (error) => {
            console.error("Error loading messages:", error);
            setMessagesLoading(false);
        });

        return unsubscribe;
    };

    const selectChat = (chat) => {
        setSelectedChat(chat);
        loadMessages(chat.id);
        markMessagesAsRead(chat.id);
    };

    const markMessagesAsRead = async (chatId) => {
        try {
            const messagesRef = collection(db, 'chats', chatId, 'messages');
            const q = query(messagesRef, where('isRead', '==', false), where('senderId', '!=', vendor?.id));
            const snapshot = await getDocs(q);

            for (const docSnapshot of snapshot.docs) {
                await updateDoc(docSnapshot.ref, { isRead: true });
            }
        } catch (error) {
            console.error("Error marking messages as read:", error);
        }
    };

    const sendReply = async () => {
        if (!inputMessage.trim() || !selectedChat) return;

        try {
            const messagesRef = collection(db, 'chats', selectedChat.id, 'messages');
            await addDoc(messagesRef, {
                senderId: vendor?.id,
                senderName: vendor?.business_name,
                message: inputMessage,
                isRead: false,
                createdAt: Date.now()
            });

            // Update chat's last message
            const chatRef = doc(db, 'chats', selectedChat.id);
            await updateDoc(chatRef, {
                lastMessage: inputMessage,
                lastMessageTime: Date.now(),
                updatedAt: Date.now()
            });

            setInputMessage('');
            toast.success('Reply sent');
        } catch (error) {
            console.error("Error sending reply:", error);
            toast.error('Failed to send reply');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendReply();
        }
    };

    if (loading) {
        return (
            <VendorLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
                </div>
            </VendorLayout>
        );
    }

    return (
        <VendorLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Customer Messages</h1>
                <p className="text-gray-500 text-sm">Chat with customers about products</p>
            </div>

            {chats.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                    <FiMessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium mb-2">No messages yet</h3>
                    <p className="text-gray-500">When customers message you about products, they will appear here.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">
                    {/* Chat List */}
                    <div className="bg-white rounded-lg shadow overflow-hidden flex flex-col">
                        <div className="p-4 border-b bg-gray-50">
                            <h2 className="font-bold">Conversations ({chats.length})</h2>
                        </div>
                        <div className="overflow-y-auto flex-1">
                            {chats.map(chat => (
                                <button
                                    key={chat.id}
                                    onClick={() => selectChat(chat)}
                                    className={`w-full text-left p-4 border-b hover:bg-gray-50 transition ${selectedChat?.id === chat.id ? 'bg-green-50 border-l-4 border-l-green-500' : ''
                                        }`}
                                >
                                    <div>
                                        <p className="font-medium">Customer</p>
                                        <p className="text-sm text-gray-500 truncate">{chat.productName}</p>
                                        {chat.lastMessage && (
                                            <p className="text-xs text-gray-400 mt-1 truncate">{chat.lastMessage.slice(0, 40)}</p>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Chat Messages */}
                    <div className="md:col-span-2 bg-white rounded-lg shadow flex flex-col">
                        {selectedChat ? (
                            <>
                                <div className="p-4 border-b bg-gray-50">
                                    <h2 className="font-bold">Chat about: {selectedChat.productName}</h2>
                                    <p className="text-xs text-gray-500">Customer ID: {selectedChat.customerId?.slice(-12)}</p>
                                </div>

                                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                    {messagesLoading ? (
                                        <div className="flex justify-center items-center h-full">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                                        </div>
                                    ) : messages.length === 0 ? (
                                        <div className="text-center text-gray-400 mt-8">
                                            <p>No messages yet</p>
                                            <p className="text-xs mt-1">Be the first to reply</p>
                                        </div>
                                    ) : (
                                        messages.map((msg, idx) => (
                                            <div
                                                key={idx}
                                                className={`flex ${msg.senderId === vendor?.id ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div
                                                    className={`max-w-[70%] p-3 rounded-lg ${msg.senderId === vendor?.id
                                                        ? 'bg-green-600 text-white rounded-br-none'
                                                        : 'bg-gray-100 text-gray-800 rounded-bl-none'
                                                        }`}
                                                >
                                                    <p className="text-sm">{msg.message}</p>
                                                    <p className={`text-xs mt-1 ${msg.senderId === vendor?.id ? 'text-green-100' : 'text-gray-400'}`}>
                                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        {msg.isRead && msg.senderId !== vendor?.id && (
                                                            <FiCheckCircle className="w-3 h-3 inline ml-1" />
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Reply Input */}
                                <div className="border-t p-3 bg-white">
                                    <div className="flex gap-2">
                                        <textarea
                                            value={inputMessage}
                                            onChange={(e) => setInputMessage(e.target.value)}
                                            onKeyPress={handleKeyPress}
                                            placeholder="Type your reply..."
                                            className="flex-1 border border-gray-300 rounded-lg p-2 resize-none focus:outline-none focus:border-green-600 text-sm"
                                            rows="2"
                                        />
                                        <button
                                            onClick={sendReply}
                                            disabled={!inputMessage.trim()}
                                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                                        >
                                            <FiSend className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-gray-400">
                                <div className="text-center">
                                    <FiMessageCircle className="w-16 h-16 mx-auto mb-3 opacity-30" />
                                    <p>Select a conversation to start chatting</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </VendorLayout>
    );
};

export default VendorInboxPage;