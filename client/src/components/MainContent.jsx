import React, { useEffect, useState } from 'react';
import { useUserContext } from '../Rol/userContext'; // Importa el hook para usar el contexto
import MenuGeneral from './MenuGeneral';
import MenuProfesor from './menuProfesores';
import EstructurasIterativas from './EstructurasIterativas';
import NuevaTutoria from './NuevaTutorias';
import SeguimientoTutorias from './Seguimiento';
import Dashboard from './nuevaTutoriaProfesor';
import HistorialTutorias from './tutoriasRealizadaProfesor';
import HistorialProyecto from './TutoriasProyecto';
import NuevaTutoriaCoordinador from './NuevatutoriaCoordinador';
import SeguimientoTutoriasCoordinador from './SeguimientoCoordinador';
import TutoriasARealizar from './TutoriasARealizar';
import TutoriasARealizarCoordinador from './TutoriasARealizarCoordinador';
import TutoriasARealizarProfesor from './TutoriasArealizarProfesor'
import '../App.css';

const MainContent = () => {
  const { role, setRole } = useUserContext(); // Usa el contexto para el rol
  const [view, setView] = useState(null);

  useEffect(() => {
    // Inicializar vista cuando el componente se monta o el rol cambia
    if (role) {
      updateView(role);
    }
  }, [role]);

  const updateView = (role) => {
    if (role === 'admin') {
      setView('estructuras');
    } else if (role === 'profesor') {
      setView('Tutorías Realizadas');
    } else if (role === 'coordinador') {
      setView('estructuras')
    }
  };

  const handleRoleChange = (newRole) => {
    setRole(newRole); // Actualiza el rol en el contexto
    updateView(newRole); // Asegúrate de actualizar la vista después de cambiar el rol
  };

  const renderView = () => {
    if (!role || view === null) return <div>Cargando...</div>;

    if (role === 'admin') {
      switch (view) {
        case 'estructuras':
          return <EstructurasIterativas />;
        case 'nueva tutoria':
          return <NuevaTutoria />;
        case 'seguimiento':
          return <SeguimientoTutorias />;
        case 'tutoria futura':
          return <TutoriasARealizar  />;
        default:
          return null;
      }
    } else if (role === 'profesor') {
      switch (view) {
        case 'Tutorías Realizadas':
          return <HistorialTutorias />;
          case 'nueva tutoria':
          return <Dashboard />;
          case 'tutoria futura':
          return <TutoriasARealizarProfesor />
        default:
          return null;
      }
    } else if (role==='coordinador'){
      switch(view){
        case 'estructuras':
         return <HistorialProyecto />;
        case 'nueva tutoria':
          return <NuevaTutoriaCoordinador/>
        case 'seguimiento':
          return <SeguimientoTutoriasCoordinador/>
        case 'tutoria futura':
          return <TutoriasARealizarCoordinador />
      }
    }

  };

  const renderMenu = () => {
    if (!role) return null;

    if (role === 'admin') {
      return <MenuGeneral setView={setView} view={view} onRoleChange={handleRoleChange} />;
    } else if (role === 'profesor') {
      return <MenuProfesor setView={setView} view={view} />;
    } else if (role === 'coordinador'){
      return <MenuGeneral setView={setView} view={view} onRoleChange={handleRoleChange} />;
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

export default MainContent;
