import React, { useState, useEffect } from 'react';

const Context = React.createContext({});

export function UserContextProvider({ children }) {
  const [jwt, setJWT] = useState(localStorage.getItem('jwt') || null);

  // Guardar el JWT en localStorage cada vez que cambie
  useEffect(() => {
    if (jwt) {
      localStorage.setItem('jwt', jwt);
    } else {
      localStorage.removeItem('jwt');
    }
  }, [jwt]);

  return (
    <Context.Provider value={{ jwt, setJWT }}>
      {children}
    </Context.Provider>
  );
}

export default Context;
