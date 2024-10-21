import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/MenuProfesor.css';

const MenuProfesor = ({ setView, view }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="navbar navbar-expand-lg menu-profesor">
      <div className="container">
        <button
          className="navbar-toggler"
          type="button"
          onClick={toggleMenu}
          aria-controls="navbarNav"
          aria-expanded={isOpen}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className={`collapse navbar-collapse ${isOpen ? 'show' : ''}`} id="navbarNav">
          <ul className="navbar-nav">
            <li className={`nav-item ${view === 'nueva tutoria' ? 'active' : ''}`}>
              <button
                className="nav-link btn"
                onClick={() => { setView('nueva tutoria'); setIsOpen(false); }}
              >
                Nueva Tutoría
              </button>
            </li>
            <li className={`nav-item ${view === 'Tutorías Realizadas' ? 'active' : ''}`}>
              <button
                className="nav-link btn"
                onClick={() => { setView('Tutorías Realizadas'); setIsOpen(false); }}
              >
                Tutorías Realizadas 
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default MenuProfesor;