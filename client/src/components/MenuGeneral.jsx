import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/MenuGeneral.css';

const MenuGeneral = ({ setView, view }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="navbar navbar-expand-lg  menu-general">
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
            <li className={`nav-item ${view === 'estructuras' ? 'active' : ''}`}>
              <button
                className="nav-link btn"
                onClick={() => { setView('estructuras'); setIsOpen(false); }}
              >
                Tutorías Realizadas
              </button>
            </li>
            <li className={`nav-item ${view === 'nueva tutoria' ? 'active' : ''}`}>
              <button
                className="nav-link btn"
                onClick={() => { setView('nueva tutoria'); setIsOpen(false); }}
              >
                Nueva Tutoría
              </button>
            </li>
            <li className={`nav-item ${view === 'seguimiento' ? 'active' : ''}`}>
              <button
                className="nav-link btn"
                onClick={() => { setView('seguimiento'); setIsOpen(false); }}
              >
                Seguimiento
              </button>
            </li>
            <li className={`nav-item ${view === 'tutoria futura' ? 'active' : ''}`}>
              <button
                className="nav-link btn"
                onClick={() => { setView('tutoria futura'); setIsOpen(false); }}
              >
                Tutorías a Realizar
              </button>
            </li>
           
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default MenuGeneral;
