import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase';
import { supabase } from '../supabaseClient';
import {
    signInWithPopup,
    GoogleAuthProvider,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUserData = async (uid) => {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', uid)
            .single();

        if (error) {
            console.error('Error fetching user data:', error);
        } else {
            setUserData(data);
        }
    };

    const loginWithGoogle = () => {
        const provider = new GoogleAuthProvider();
        return signInWithPopup(auth, provider);
    };

    const loginWithEmail = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    const signupWithEmail = (email, password) => {
        return createUserWithEmailAndPassword(auth, email, password);
    };

    const logout = () => {
        return signOut(auth);
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            if (user) {
                await fetchUserData(user.uid);
            } else {
                setUserData(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const incrementUsage = async () => {
        if (!currentUser || !userData) return;

        const newCount = (userData.usage_count || 0) + 1;
        const { error } = await supabase
            .from('users')
            .update({ usage_count: newCount })
            .eq('id', currentUser.uid);

        if (!error) {
            setUserData(prev => ({ ...prev, usage_count: newCount }));
        }
    };

    const value = {
        currentUser,
        userData,
        fetchUserData: () => fetchUserData(currentUser?.uid),
        incrementUsage,
        loginWithGoogle,
        loginWithEmail,
        signupWithEmail,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
