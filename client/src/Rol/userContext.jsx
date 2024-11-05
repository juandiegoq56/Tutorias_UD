// userContext.js
import React, { useState, useEffect, createContext, useContext } from 'react';

const UserContext = createContext({});

export function UserContextProvider({ children }) {
  const [jwt, setJWT] = useState(localStorage.getItem('jwt') || null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    if (jwt) {
      localStorage.setItem('jwt', jwt);
    } else {
      localStorage.removeItem('jwt');
    }
  }, [jwt]);

  return (
    <UserContext.Provider value={{ jwt, setJWT, role, setRole }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUserContext = () => useContext(UserContext);

export default UserContext;
