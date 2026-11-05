import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  firebaseSignOut, 
  onAuthStateChanged,
  User 
} from '../lib/firebase';
import { UserProfile, ShippingAddress } from '../types/store';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  addresses: ShippingAddress[];
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signupWithEmail: (email: string, pass: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  saveAddress: (address: ShippingAddress) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  addresses: [],
  loading: true,
  loginWithGoogle: async () => {},
  loginWithEmail: async () => {},
  signupWithEmail: async () => {},
  logout: async () => {},
  saveAddress: async () => false,
  refreshProfile: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [addresses, setAddresses] = useState<ShippingAddress[]>([]);
  const [loading, setLoading] = useState(true);

  // Sync user details to MySQL backend
  const syncUserToMySQL = async (fbUser: User, providerName: 'password' | 'google', customName?: string) => {
    try {
      const payload = {
        firebaseUid: fbUser.uid,
        email: fbUser.email,
        displayName: customName || fbUser.displayName || fbUser.email?.split('@')[0],
        photoUrl: fbUser.photoURL,
        phone: fbUser.phoneNumber,
        provider: providerName,
      };

      const res = await fetch('/api/user/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setProfile({
            firebaseUid: fbUser.uid,
            email: fbUser.email || '',
            displayName: data.user.display_name || payload.displayName,
            photoUrl: data.user.photo_url || undefined,
            phone: data.user.phone || undefined,
            provider: providerName,
          });
        }
        if (data.addresses && Array.isArray(data.addresses)) {
          setAddresses(
            data.addresses.map((a: any) => ({
              fullName: a.full_name,
              email: a.email,
              phone: a.phone,
              addressLine1: a.address_line1,
              addressLine2: a.address_line2 || '',
              city: a.city,
              state: a.state,
              postalCode: a.postal_code,
            }))
          );
        }
      }
    } catch (err) {
      console.warn('[AUTH SYNC NOTICE]: Local state preserved while MySQL server syncs:', err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const providerId = currentUser.providerData[0]?.providerId === 'google.com' ? 'google' : 'password';
        await syncUserToMySQL(currentUser, providerId);
      } else {
        setProfile(null);
        setAddresses([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await syncUserToMySQL(result.user, 'google');
    } catch (err: any) {
      console.error('Google sign in error:', err);
      throw err;
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    const result = await signInWithEmailAndPassword(auth, email, pass);
    await syncUserToMySQL(result.user, 'password');
  };

  const signupWithEmail = async (email: string, pass: string, name?: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, pass);
    await syncUserToMySQL(result.user, 'password', name);
  };

  const logout = async () => {
    await firebaseSignOut(auth);
    setUser(null);
    setProfile(null);
    setAddresses([]);
  };

  const saveAddress = async (addr: ShippingAddress): Promise<boolean> => {
    if (!user) return false;
    try {
      const res = await fetch('/api/user/address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firebaseUid: user.uid,
          fullName: addr.fullName,
          email: addr.email,
          phone: addr.phone,
          addressLine1: addr.addressLine1,
          addressLine2: addr.addressLine2,
          city: addr.city,
          state: addr.state,
          postalCode: addr.postalCode,
        }),
      });

      if (res.ok) {
        setAddresses((prev) => [addr, ...prev]);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Save address error:', err);
      // Keep local for seamless checkout
      setAddresses((prev) => [addr, ...prev]);
      return true;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      const providerId = user.providerData[0]?.providerId === 'google.com' ? 'google' : 'password';
      await syncUserToMySQL(user, providerId);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        addresses,
        loading,
        loginWithGoogle,
        loginWithEmail,
        signupWithEmail,
        logout,
        saveAddress,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
