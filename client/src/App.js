import React, { useState, useEffect } from 'react';
import MenuGeneral from './components/MenuGeneral';
import MenuProfesor from './components/menuProfesores';
import EstructurasIterativas from './components/EstructurasIterativas';
import NuevaTutoria from './components/NuevaTutorias';
import SeguimientoTutorias from './components/Seguimiento';
import { UserContextProvider } from './Rol/userContext';
import { ProtectedRoute } from "./Rol/middelware";
import { BrowserRouter as Router, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import Dashboard from './components/nuevaTutoriaProfesor';
import HistorialTutorias from './components/tutoriasRealizadaProfesor'
import './App.css';

const MainContent = () => {
  const navigate = useNavigate();
  const { profesorId } = useParams();
  const [userRole, setUserRole] = useState(localStorage.getItem('Rol'));
  const [view, setView] = useState(null); // Inicializar como null

  useEffect(() => {
    // Simulación de obtención de rol basado en profesorId
    const fetchRoleForProfesor = (id) => {
      const roles = {
        '73080488': 'profesor',
        '1005741483': 'admin',
      };
      return roles[id] || 'profesor'; // Valor por defecto
    };

    const newRole = fetchRoleForProfesor(profesorId);
    if (newRole !== userRole) {
      setUserRole(newRole);
      localStorage.setItem('Rol', newRole);
    }

    // Establecer vista inicial basada en el rol
    if (newRole === 'admin') {
      setView('estructuras');
    } else if (newRole === 'profesor') {
      setView('nueva tutoria');
    }
  }, [profesorId, userRole]);

  const renderView = () => {
    if (!userRole || view === null) return <div>Cargando...</div>;

    if (userRole === 'admin') {
      switch (view) {
        case 'estructuras':
          return <EstructurasIterativas />;
        case 'nueva tutoria':
          return <NuevaTutoria />;
        case 'seguimiento':
          return <SeguimientoTutorias />;
        default:
          return null;
      }
    } else if (userRole === 'profesor') {
      switch (view) {
        case 'nueva tutoria':
          return <Dashboard />;
        case 'Tutorías Realizadas':
          return <HistorialTutorias />;
        default:
          return null;
      }
    }
  };

  const renderMenu = () => {
    if (!userRole) return null;

    if (userRole === 'admin') {
      return <MenuGeneral setView={setView} view={view} />;
    } else if (userRole === 'profesor') {
      return <MenuProfesor setView={setView} view={view} />;
    }
  };

  return (
    <>
      {renderMenu()}
      <div className="lista-tutorias">
        {renderView()}
      </div>
    </>
  );
};

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
