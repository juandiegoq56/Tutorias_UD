import { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import UserContext from './userContext';
import { jwtDecode } from 'jwt-decode';

export default function useUser() {
  const { setJWT, setRole } = useContext(UserContext); // Añade setRole para manejar el rol
  const { profesorId } = useParams();
  const navigate = useNavigate();
  const [isLogged, setIsLogged] = useState(Boolean(localStorage.getItem('jwt')));

  useEffect(() => {
    const login = async (profesorId) => {
      console.log('Intentando iniciar sesión con profesorId:', profesorId);

      try {
        const response = await fetch('http://localhost:3001/api/tutoring/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ profesorId }),
        });

        console.log('Respuesta del servidor:', response);

        if (!response.ok) throw new Error('ID de profesor no válido');

        const { token, role } = await response.json();
        console.log('Token recibido:', token);
        console.log('Rol recibido:', role);

        setJWT(token);
        setRole(role); // Establece el rol en el contexto

        localStorage.setItem('jwt', token);
        
        setIsLogged(true);
        navigate(`/${profesorId}`);
       
      } catch (error) {
        console.error('Error en el login:', error);
        setJWT(null);
        setRole(null); // Limpia el rol en caso de error
        localStorage.removeItem('jwt');
        window.location.href = 'https://estudiantes.portaloas.udistrital.edu.co/appserv/';
        setIsLogged(false);
      }
    };

    console.log('profesorId:', profesorId);

    if (profesorId) {
      login(profesorId);
    }
  }, [profesorId, setJWT, setRole, navigate]);

  useEffect(() => {
    const checkTokenExpiration = () => {
      const token = localStorage.getItem('jwt');
      if (!token) return;

      try {
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decodedToken.exp < currentTime) {
          console.log('El token ha expirado');
          setJWT(null);
          setRole(null);
          localStorage.removeItem('jwt');
          setIsLogged(false);
          window.location.href = 'https://estudiantes.portaloas.udistrital.edu.co/appserv/';
        }
      } catch (error) {
        console.error('Error decodificando el token:', error);
        setJWT(null);
        setRole(null);
        localStorage.removeItem('jwt');
        setIsLogged(false);
        window.location.href = 'https://estudiantes.portaloas.udistrital.edu.co/appserv/';
      }
    };

    checkTokenExpiration();
    const intervalId = setInterval(checkTokenExpiration, 60000);

    return () => clearInterval(intervalId);
  }, [setJWT, setRole, navigate]);

  const logout = () => {
    console.log('Cerrando sesión');
    setJWT(null);
    setRole(null);
    localStorage.removeItem('jwt');
    setIsLogged(false);
    navigate('/login');
  };

  return {
    isLogged,
    logout,
  };
}
