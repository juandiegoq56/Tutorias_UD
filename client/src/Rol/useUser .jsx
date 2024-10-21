import { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import UserContext from './userContext';
import { jwtDecode } from 'jwt-decode';

export default function useUser() {
  const { setJWT } = useContext(UserContext);
  const { profesorId } = useParams();
  const navigate = useNavigate();
  const [isLogged, setIsLogged] = useState(Boolean(localStorage.getItem('jwt')));

  useEffect(() => {
    const login = async (profesorId) => {
      console.log('Intentando iniciar sesión con profesorId:', profesorId);

      try {
        const response = await fetch('http://192.168.0.46:3001/api/tutoring/login', {
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

        localStorage.setItem('Rol', role);
        setJWT(token);
        localStorage.setItem('jwt', token);
        
        setIsLogged(true);
        navigate(`/${profesorId}`);
       
      } catch (error) {
        console.error('Error en el login:', error);
        setJWT(null);
        localStorage.removeItem('jwt');
        localStorage.removeItem('Rol');
        window.location.href = 'https://estudiantes.portaloas.udistrital.edu.co/appserv/';
        setIsLogged(false);
      }
    };

    console.log('profesorId:', profesorId);

    if (profesorId) {
      login(profesorId);
    }
  }, [profesorId, setJWT, navigate]);

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
          localStorage.removeItem('jwt');
          localStorage.removeItem('Rol');
          setIsLogged(false);
          window.location.href = 'https://estudiantes.portaloas.udistrital.edu.co/appserv/';
        }
      } catch (error) {
        console.error('Error decodificando el token:', error);
        setJWT(null);
        localStorage.removeItem('jwt');
        localStorage.removeItem('Rol');
        setIsLogged(false);
        window.location.href = 'https://estudiantes.portaloas.udistrital.edu.co/appserv/';
      }
    };

    checkTokenExpiration();
    const intervalId = setInterval(checkTokenExpiration, 60000);

    return () => clearInterval(intervalId);
  }, [setJWT, navigate]);

  const logout = () => {
    console.log('Cerrando sesión');
    setJWT(null);
    localStorage.removeItem('jwt');
    setIsLogged(false);
    navigate('/login');
  };

  return {
    isLogged,
    logout,
  };
}
