
import { db } from '../firebase';
import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    addDoc,
    deleteDoc,
    serverTimestamp
} from 'firebase/firestore';
import { User } from 'firebase/auth';
import { ChatHistory, SavedStack } from '../types';

export const dbService = {
    // --- User Profile ---
    async syncUserProfile(user: User) {
        if (!user) return;
        try {
            const userRef = doc(db, 'users', user.uid);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
                await setDoc(userRef, {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                    photoURL: user.photoURL,
                    createdAt: serverTimestamp(),
                    lastLogin: serverTimestamp()
                });
            } else {
                await setDoc(userRef, {
                    lastLogin: serverTimestamp(),
                    // Update these if they changed
                    email: user.email,
                    displayName: user.displayName,
                    photoURL: user.photoURL
                }, { merge: true });
            }
        } catch (error) {
            console.error("Error syncing user profile:", error);
        }
    },

    // --- Saved Stacks (Bookmarks) ---
    async saveStack(userId: string, stack: SavedStack) {
        if (!userId) return;
        try {
            const safeId = encodeURIComponent(stack.stackId);
            const stackRef = doc(db, 'users', userId, 'saved_stacks', safeId);

            await setDoc(stackRef, {
                ...stack,
                savedAt: serverTimestamp()
            });
        } catch (error) {
            console.error("Error saving stack:", error);
            throw error; // Propagate to let UI revert optimistic update
        }
    },

    async removeStack(userId: string, stackId: string) {
        if (!userId) return;
        try {
            const safeId = encodeURIComponent(stackId);
            const stackRef = doc(db, 'users', userId, 'saved_stacks', safeId);
            await deleteDoc(stackRef);
        } catch (error) {
            console.error("Error removing stack:", error);
            throw error;
        }
    },

    async getSavedStacks(userId: string): Promise<SavedStack[]> {
        if (!userId) return [];
        try {
            const q = query(collection(db, 'users', userId, 'saved_stacks'), orderBy('savedAt', 'desc'));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => doc.data() as SavedStack);
        } catch (error) {
            console.error("Error fetching saved stacks:", error);
            return [];
        }
    },

    // --- Chat History ---
    async saveChatHistory(userId: string, history: ChatHistory) {
        if (!userId || !history.id) return;
        try {
            const historyRef = doc(db, 'users', userId, 'chat_history', history.id);
            await setDoc(historyRef, {
                ...history,
                lastUpdated: serverTimestamp()
            });
        } catch (error) {
            console.error("Error saving chat history:", error);
        }
    },

    async deleteChatHistory(userId: string, historyId: string) {
        try {
            const historyRef = doc(db, 'users', userId, 'chat_history', historyId);
            await deleteDoc(historyRef);
        } catch (error) {
            console.error("Error deleting chat history:", error);
            throw error;
        }
    },

    async logActivity(userId: string, type: string, metadata: Record<string, unknown> = {}) {
        try {
            const logsRef = collection(db, 'users', userId, 'activity_log');
            await addDoc(logsRef, {
                type,
                metadata,
                timestamp: Date.now(),
                date: new Date().toISOString()
            });
        } catch (error) {
            console.error("Error logging activity:", error);
            // Fail silently to not disrupt UX
        }
    },

    async getChatHistory(userId: string): Promise<ChatHistory[]> {
        if (!userId) return [];
        try {
            const q = query(collection(db, 'users', userId, 'chat_history'), orderBy('lastUpdated', 'desc'));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => doc.data() as ChatHistory);
        } catch (error) {
            console.error("Error fetching chat history:", error);
            return [];
        }
    }
};
