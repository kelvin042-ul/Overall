import { useState, useEffect, useRef } from 'react';
import { FiMessageCircle, FiX, FiSend, FiCopy, FiTrash2, FiEdit2 } from 'react-icons/fi';
import { useChat } from '../context/ChatContext';
import toast from 'react-hot-toast';

const ChatWidget = ({ vendorId, vendorName, productId, productName }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [chat, setChat] = useState(null);
    const [loading, setLoading] = useState(false);
    const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, message: null });
    const [editingMessage, setEditingMessage] = useState(null);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const { getOrCreateChat, sendMessage, getMessages, deleteMessage, editMessage } = useChat();

    useEffect(() => {
        if (isOpen && vendorId && productId) {
            initChat();
        }
    }, [isOpen, vendorId, productId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const handleClickOutside = () => {
            setContextMenu({ visible: false, x: 0, y: 0, message: null });
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const initChat = async () => {
        setLoading(true);
        try {
            const chatData = await getOrCreateChat(vendorId, vendorName, productId, productName);
            if (chatData) {
                setChat(chatData);

                const unsubscribe = getMessages(chatData.id, (newMessages) => {
                    setMessages(newMessages);
                });

                return () => {
                    if (unsubscribe) unsubscribe();
                };
            }
        } catch (error) {
            console.error('Error initializing chat:', error);
            toast.error('Could not start chat');
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async () => {
        // If editing a message, save it instead of sending new
        if (editingMessage) {
            const success = await editMessage(chat.id, editingMessage.id, inputMessage);
            if (success) {
                toast.success('Message edited');
                setEditingMessage(null);
                setInputMessage('');
            } else {
                toast.error('Failed to edit message');
            }
            return;
        }

        // Regular send message
        if (!inputMessage.trim()) return;
        if (!chat) {
            toast.error('Chat not ready');
            return;
        }

        const customerId = localStorage.getItem('chat_customer_id');
        const success = await sendMessage(chat.id, customerId, 'You', inputMessage);

        if (success) {
            setInputMessage('');
        } else {
            toast.error('Failed to send message');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // Right click handler
    const handleContextMenu = (e, message) => {
        e.preventDefault();
        setContextMenu({
            visible: true,
            x: e.clientX,
            y: e.clientY,
            message: message
        });
    };

    // Touch hold handler for mobile
    const handleTouchStart = (e, message) => {
        e.preventDefault();
        const touch = e.touches[0];
        setContextMenu({
            visible: true,
            x: touch.clientX,
            y: touch.clientY,
            message: message
        });
    };

    // Copy message
    const handleCopyMessage = () => {
        if (contextMenu.message) {
            navigator.clipboard.writeText(contextMenu.message.message);
            toast.success('Message copied');
            setContextMenu({ visible: false, x: 0, y: 0, message: null });
        }
    };

    // Delete message
    const handleDeleteMessage = async () => {
        if (contextMenu.message && chat) {
            const success = await deleteMessage(chat.id, contextMenu.message.id);
            if (success) {
                toast.success('Message deleted');
            } else {
                toast.error('Failed to delete message');
            }
            setContextMenu({ visible: false, x: 0, y: 0, message: null });
        }
    };

    // Start editing - puts message in input box
    const handleStartEdit = () => {
        if (contextMenu.message) {
            setEditingMessage(contextMenu.message);
            setInputMessage(contextMenu.message.message);
            setContextMenu({ visible: false, x: 0, y: 0, message: null });
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    };

    const customerId = localStorage.getItem('chat_customer_id');

    if (!vendorId) return null;

    return (
        <>
            {/* Chat Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 z-50 bg-green-600 text-white p-4 rounded-full shadow-lg hover:bg-green-700 transition-all hover:scale-110"
            >
                {isOpen ? <FiX className="w-6 h-6" /> : <FiMessageCircle className="w-6 h-6" />}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 w-[90vw] sm:w-96 md:w-[450px] h-[550px] md:h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200 overflow-hidden">
                    {/* Header */}
                    <div className="bg-green-600 text-white p-4">
                        <h3 className="font-bold">Chat with {vendorName}</h3>
                        <p className="text-sm opacity-90">About: {productName}</p>
                        {editingMessage && (
                            <p className="text-xs mt-1 opacity-80">Editing message...</p>
                        )}
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                        {loading ? (
                            <div className="flex justify-center items-center h-full">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="text-center text-gray-400 mt-8">
                                <FiMessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>Send a message to {vendorName}</p>
                                <p className="text-xs mt-1">Ask about product details, availability, or shipping</p>
                            </div>
                        ) : (
                            messages.map((msg, idx) => (
                                <div
                                    key={idx}
                                    className={`flex ${msg.senderId === customerId ? 'justify-end' : 'justify-start'}`}
                                    onContextMenu={(e) => msg.senderId === customerId && handleContextMenu(e, msg)}
                                    onTouchStart={(e) => msg.senderId === customerId && handleTouchStart(e, msg)}
                                >
                                    <div
                                        className={`max-w-[75%] p-3 rounded-lg ${msg.senderId === customerId
                                            ? 'bg-green-600 text-white rounded-br-none'
                                            : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'
                                            }`}
                                    >
                                        <p className="text-sm">{msg.message}</p>
                                        <p className={`text-xs mt-1 ${msg.senderId === customerId ? 'text-green-100' : 'text-gray-400'}`}>
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            {msg.isEdited && <span className="ml-1 opacity-70">(edited)</span>}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="border-t p-3 bg-white">
                        <div className="flex gap-2">
                            <textarea
                                ref={inputRef}
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder={editingMessage ? "Edit your message..." : "Type your message..."}
                                className="flex-1 border border-gray-300 rounded-lg p-2 resize-none focus:outline-none focus:border-green-600 text-sm"
                                rows="2"
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={!inputMessage.trim()}
                                className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                            >
                                <FiSend className="w-5 h-5" />
                            </button>
                        </div>
                        {editingMessage && (
                            <button
                                onClick={() => {
                                    setEditingMessage(null);
                                    setInputMessage('');
                                }}
                                className="text-xs text-gray-400 mt-1 hover:text-gray-600"
                            >
                                Cancel edit
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Context Menu (Right Click / Long Press) */}
            {contextMenu.visible && (
                <div
                    className="fixed z-[100] bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                >
                    <button
                        onClick={handleCopyMessage}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                        <FiCopy className="w-4 h-4" /> Copy Message
                    </button>
                    <button
                        onClick={handleStartEdit}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                        <FiEdit2 className="w-4 h-4" /> Edit Message
                    </button>
                    <button
                        onClick={handleDeleteMessage}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                        <FiTrash2 className="w-4 h-4" /> Delete Message
                    </button>
                </div>
            )}
        </>
    );
};

export default ChatWidget;