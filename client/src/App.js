import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserContextProvider } from './Rol/userContext';
import { ProtectedRoute } from './Rol/middelware';
import MainContent from './components/MainContent';

const App = () => {
  return (
    <div>
      <UserContextProvider>
        <Router>
          <Routes>
            <Route
              path="/:profesorId"
              element={
                <ProtectedRoute redirectTo="https://estudiantes.portaloas.udistrital.edu.co/appserv/">
                  <MainContent />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </UserContextProvider>
    </div>
  );
};

export default App;
