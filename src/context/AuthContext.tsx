import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  UserCredential,
} from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';

import { auth, db } from '../firebase';

interface IAuthContextProviderProps {
  children: ReactNode;
}

interface IAuthContextProps {
  user: User | null;
  signUp: (email: string, password: string) => void;
  logIn: (email: string, password: string) => Promise<UserCredential>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<IAuthContextProps>({
  user: null,
  signUp: () => {},
  logIn: () => {
    throw new Error('AuthContext not yet initialized');
  },
  logOut: () => {
    throw new Error('AuthContext not yet initialized');
  },
});

export function AuthContextProvider({ children }: IAuthContextProviderProps) {
  const [user, setUser] = useState<User | null>(null);

  function signUp(email: string, password: string) {
    createUserWithEmailAndPassword(auth, email, password);
    setDoc(doc(db, 'users', email), {
      savedShows: [],
    });
  }

  function logIn(email: string, password: string) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logOut() {
    return signOut(auth);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => {
      unsubscribe();
    };
  });

  return (
    <AuthContext.Provider value={{ signUp, logIn, logOut, user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function UserAuth() {
  return useContext(AuthContext);
}
