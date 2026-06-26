import { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { supabase } from '../lib/supabase';
import {
    collection,
    addDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    deleteDoc,
    updateDoc,
    doc,
    getDocs
} from 'firebase/firestore';

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
    const [userId, setUserId] = useState(null);
    const [isReady, setIsReady] = useState(false);

    // Initialize Firebase Auth (anonymous)
    useEffect(() => {
        const initFirebaseAuth = async () => {
            const auth = getAuth();

            // Check if already has anonymous user
            if (auth.currentUser) {
                setUserId(auth.currentUser.uid);
                localStorage.setItem('firebase_uid', auth.currentUser.uid);
                setIsReady(true);
                return;
            }

            // Sign in anonymously
            try {
                const userCredential = await signInAnonymously(auth);
                setUserId(userCredential.user.uid);
                localStorage.setItem('firebase_uid', userCredential.user.uid);
                console.log("Firebase anonymous user created:", userCredential.user.uid);
            } catch (error) {
                console.error("Anonymous auth error:", error);
                // Fallback to localStorage ID
                let fallbackId = localStorage.getItem('chat_fallback_id');
                if (!fallbackId) {
                    fallbackId = `temp_${Date.now()}`;
                    localStorage.setItem('chat_fallback_id', fallbackId);
                }
                setUserId(fallbackId);
            }
            setIsReady(true);
        };

        initFirebaseAuth();
    }, []);

    // Get current user identifier (for vendor vs customer)
    const getCurrentUserId = async () => {
        // Check if vendor is logged in via Supabase
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
            return { id: session.user.id, type: 'vendor', name: session.user.email };
        }
        // Customer (anonymous Firebase)
        return { id: userId, type: 'customer', name: 'Customer' };
    };

    const getOrCreateChat = async (vendorId, vendorName, productId, productName) => {
        if (!userId && !(await getCurrentUserId())) return null;

        const currentUser = await getCurrentUserId();
        const customerId = currentUser.type === 'customer' ? currentUser.id : userId;

        try {
            const chatsRef = collection(db, 'chats');
            const q = query(
                chatsRef,
                where('customerId', '==', customerId),
                where('vendorId', '==', vendorId),
                where('productId', '==', productId)
            );

            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const docSnap = querySnapshot.docs[0];
                return { id: docSnap.id, ...docSnap.data() };
            }

            const newChat = {
                customerId: customerId,
                vendorId: vendorId,
                vendorName: vendorName,
                productId: productId,
                productName: productName,
                lastMessage: '',
                lastMessageTime: Date.now(),
                unreadCount: 0,
                createdAt: Date.now(),
                updatedAt: Date.now()
            };

            const docRef = await addDoc(chatsRef, newChat);
            return { id: docRef.id, ...newChat };

        } catch (error) {
            console.error('Error in getOrCreateChat:', error);
            return null;
        }
    };

    const sendMessage = async (chatId, senderId, senderName, message) => {
        if (!message.trim()) return false;

        try {
            const messagesRef = collection(db, 'chats', chatId, 'messages');

            await addDoc(messagesRef, {
                senderId: senderId,
                senderName: senderName,
                message: message,
                isRead: false,
                createdAt: Date.now()
            });

            await updateDoc(doc(db, 'chats', chatId), {
                lastMessage: message,
                lastMessageTime: Date.now(),
                updatedAt: Date.now()
            });

            return true;
        } catch (error) {
            console.error('Error sending message:', error);
            return false;
        }
    };

    const getMessages = (chatId, callback) => {
        const messagesRef = collection(db, 'chats', chatId, 'messages');
        const q = query(messagesRef, orderBy('createdAt', 'asc'));

        return onSnapshot(q, (snapshot) => {
            const messages = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            callback(messages);
        });
    };

    // Delete a message
    const deleteMessage = async (chatId, messageId) => {
        try {
            const messageRef = doc(db, 'chats', chatId, 'messages', messageId);
            await deleteDoc(messageRef);
            return true;
        } catch (error) {
            console.error('Error deleting message:', error);
            return false;
        }
    };

    // Edit a message
    const editMessage = async (chatId, messageId, newMessage) => {
        try {
            const messageRef = doc(db, 'chats', chatId, 'messages', messageId);
            await updateDoc(messageRef, {
                message: newMessage,
                isEdited: true,
                editedAt: Date.now()
            });
            return true;
        } catch (error) {
            console.error('Error editing message:', error);
            return false;
        }
    };

    const getVendorChats = async (vendorId, callback) => {
        const chatsRef = collection(db, 'chats');
        const q = query(chatsRef, where('vendorId', '==', vendorId), orderBy('updatedAt', 'desc'));

        return onSnapshot(q, (snapshot) => {
            const chats = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            callback(chats);
        });
    };

    const markAsRead = async (chatId) => {
        try {
            const messagesRef = collection(db, 'chats', chatId, 'messages');
            const q = query(messagesRef, where('isRead', '==', false));
            const snapshot = await getDocs(q);

            for (const docSnap of snapshot.docs) {
                await updateDoc(docSnap.ref, { isRead: true });
            }
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    return (
        <ChatContext.Provider value={{
            userId,
            isReady,
            getCurrentUserId,
            getOrCreateChat,
            sendMessage,
            getMessages,
            getVendorChats,
            deleteMessage,
            editMessage,
            markAsRead
        }}>
            {children}
        </ChatContext.Provider>
    );
};