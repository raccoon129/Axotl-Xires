"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Menu, X, Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import BarraProgreso from "./Navbar_BarraProgreso";
import { ResultadosBusqueda } from "../busqueda/ResultadosBusqueda";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const pathname = usePathname();
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const busquedaRef = useRef<HTMLDivElement>(null);
  const verMasRef = useRef<HTMLButtonElement>(null);

  const { isLoggedIn, isLoading, logout, idUsuario } = useAuth();

  // Obtener datos del usuario
  useEffect(() => {
    const fetchUserData = async () => {
      if (idUsuario) {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/usuarios/${idUsuario}`,
            {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            }
          );
          if (response.ok) {
            const data = await response.json();
            setUserData(data.datos);
          }
        } catch (error) {
          console.error('Error al obtener datos del usuario:', error);
        }
      }
    };

    fetchUserData();
  }, [idUsuario]);

  // Obtener el primer nombre del usuario
  const getFirstName = () => {
    if (!userData?.nombre) return '';
    return userData.nombre.split(' ')[0];
  };

  // Manejar clics fuera de los menús
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cerrar menús al cambiar de ruta
  useEffect(() => {
    const handleRouteChange = () => {
      setIsMenuOpen(false);
      setIsUserMenuOpen(false);
      setIsNotificationsOpen(false);
    };

    // Limpiar los event listeners
    return () => {
      handleRouteChange();
    };
  }, []);

  // Manejar el cierre de sesión
  const handleLogout = async () => {
    await logout();
    setIsUserMenuOpen(false);
  };

  // Añadir este nuevo componente para la foto de perfil
  const FotoPerfilLoader = ({ userData }: { userData: any }) => {
    const [imagenCargada, setImagenCargada] = useState(false);

    return (
      <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100">
        {!imagenCargada && (
          <Skeleton className="w-full h-full" />
        )}
        <img 
          src={`${process.env.NEXT_PUBLIC_API_URL}/api/usuarios/foto-perfil/${userData?.foto_perfil || 'null'}`}
          alt=""
          className={`w-full h-full object-cover ${!imagenCargada ? 'hidden' : ''}`}
          onLoad={() => setImagenCargada(true)}
        />
      </div>
    );
  };

  // Componente para los botones de autenticación con layout fijo
  const AuthButtons = () => {
    return (
      <div className="ml-4 w-32 h-10 flex items-center justify-end">
        {isLoading ? (
          <Skeleton className="w-full h-9" />
        ) : isLoggedIn ? (
          <div className="flex items-center space-x-4">
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 bg-white"
                aria-label="Notificaciones"
              >
                <Bell className="h-5 w-5 text-gray-600" />
              </button>
              <AnimatePresence>
                {isNotificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50"
                  >
                    <p className="text-gray-500 text-sm">No tienes notificaciones</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2 hover:bg-gray-100 rounded-full p-1 transition-colors duration-200 bg-white"
                aria-label="Menú de usuario"
              >
                <FotoPerfilLoader userData={userData} />
              </button>
              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
                  >
                    <div className="p-4">
                      <p className="text-gray-800 font-semibold truncate">
                        Hola, {getFirstName()}
                      </p>
                      <Link
                        href="/perfiles"
                        className="block mt-2 text-sm text-gray-600 bg-white hover:bg-gray-50 px-2 py-1 rounded-md transition-colors duration-200"
                      >
                        Mi perfil
                      </Link>
                      <Link
                        href="/configuracion"
                        className="block mt-2 text-sm text-gray-600 bg-white hover:bg-gray-50 px-2 py-1 rounded-md transition-colors duration-200"
                      >
                        Configuración
                      </Link>
                      <Link
                        href="/perfiles/mispublicaciones"
                        className="block mt-2 text-sm text-gray-600 bg-white hover:bg-gray-50 px-2 py-1 rounded-md transition-colors duration-200"
                      >
                        Administrar mis publicaciones
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left text-red-600 font-semibold mt-4 px-2 py-1 bg-white hover:bg-red-50 rounded-md transition-colors duration-200"
                      >
                        Cerrar Sesión
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        ) : (
          <Link href="/login" passHref>
            <Button variant="outline" className="w-full bg-white hover:bg-gray-50">
              Iniciar Sesión
            </Button>
          </Link>
        )}
      </div>
    );
  };

  useEffect(() => {
    setIsPageLoading(true);
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [pathname]);

  const handleLinkClick = () => {
    setIsPageLoading(true);
    setIsMenuOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && terminoBusqueda.trim()) {
      e.preventDefault();
      // Simular clic en el botón "Ver más"
      verMasRef.current?.click();
    }
  };

  return (
    <>
      {/* Espacio reservado para el navbar */}
      <div className="h-20"></div>
      
      {/* Navbar fijo */}
      <nav className="bg-white shadow-md fixed top-0 left-0 right-0 z-40">
        <BarraProgreso isLoading={isPageLoading} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-20">
            {/* Logo y texto - ancho fijo */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center">
                <Image
                  src={`${process.env.NEXT_PUBLIC_ASSET_URL}/AjoloteMorado.svg`}
                  alt="Axotl Xires Logo"
                  width={60}
                  height={60}
                  className="transition-transform duration-300 hover:scale-110"
                />
                <span className="ml-2 text-2xl font-bold text-gray-800">
                  Axotl.org
                </span>
              </Link>
            </div>

            {/* Enlaces de navegación - espacio flexible */}
            <div className="hidden sm:flex items-center justify-start flex-1 ml-8">
              <div className="flex space-x-4">
                <Link
                  href="/explorar"
                  onClick={handleLinkClick}
                  className="text-gray-700 hover:text-gray-900 px-2 py-2 rounded-md text-sm font-medium transition-colors duration-200 bg-white hover:bg-gray-50"
                >
                  Explorar
                </Link>
                <Link
                  href="/categorias"
                  onClick={handleLinkClick}
                  className="text-gray-700 hover:text-gray-900 px-2 py-2 rounded-md text-sm font-medium transition-colors duration-200 bg-white hover:bg-gray-50"
                >
                  Categorías
                </Link>
                <Link
                  href="/redactar"
                  onClick={handleLinkClick}
                  className="text-gray-700 hover:text-gray-900 px-2 py-2 rounded-md text-sm font-medium transition-colors duration-200 bg-white hover:bg-gray-50"
                >
                  Redactar
                </Link>
              </div>
            </div>

            {/* Barra de búsqueda y autenticación - ancho fijo */}
            <div className="hidden sm:flex items-center flex-1 justify-end">
              <div className="relative flex-1 max-w-xl" ref={busquedaRef}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Busca algo interesante"
                    value={terminoBusqueda}
                    onChange={(e) => {
                      setTerminoBusqueda(e.target.value);
                      setMostrarResultados(e.target.value.length > 0);
                    }}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                      if (terminoBusqueda.length > 0) {
                        setMostrarResultados(true);
                      }
                    }}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg 
                             focus:outline-none focus:ring-2 focus:ring-[#612c7d] focus:ring-opacity-50 
                             focus:border-transparent transition-all duration-200
                             placeholder:text-gray-400 text-gray-900"
                  />
                </div>

                <AnimatePresence>
                  {mostrarResultados && terminoBusqueda.length > 0 && (
                    <ResultadosBusqueda
                      busqueda={terminoBusqueda}
                      onClose={() => {
                        setMostrarResultados(false);
                        setTerminoBusqueda('');
                      }}
                      verMasRef={verMasRef}
                    />
                  )}
                </AnimatePresence>
              </div>
              <AuthButtons />
            </div>

            {/* Botón de menú móvil - Ajustado */}
            <div className="sm:hidden flex items-center ml-auto">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500 transition-colors duration-200"
                aria-expanded="false"
              >
                <span className="sr-only">Abrir menú principal</span>
                {isMenuOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Menú móvil */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="sm:hidden border-t border-gray-200 bg-white"
            >
              <div className="px-2 pt-2 pb-3 space-y-1">
                <Link
                  href="/busqueda"
                  onClick={handleLinkClick}
                  className="text-gray-700 bg-white hover:bg-gray-50 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                >
                  Buscar
                </Link>
                <Link
                  href="/explorar"
                  onClick={handleLinkClick}
                  className="text-gray-700 bg-white hover:bg-gray-50 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                >
                  Explorar
                </Link>
                <Link
                  href="/categorias"
                  onClick={handleLinkClick}
                  className="text-gray-700 bg-white hover:bg-gray-50 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                >
                  Categorías
                </Link>
                <Link
                  href="/redactar"
                  onClick={handleLinkClick}
                  className="text-gray-700 bg-white hover:bg-gray-50 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                >
                  Redactar
                </Link>
              </div>
              <div className="pt-4 pb-3 border-t border-gray-200 px-4">
                {isLoading ? (
                  <Skeleton className="h-10 w-full" />
                ) : isLoggedIn ? (
                  <div className="flex flex-col space-y-2">
                    <p className="text-gray-800 font-semibold px-3 py-2">
                      Hola, {getFirstName()}
                    </p>
                    <Link
                      href="/perfiles"
                      onClick={handleLinkClick}
                      className="text-gray-700 bg-white hover:bg-gray-50 hover:text-gray-900 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                    >
                      Mi perfil
                    </Link>
                    <Link
                      href="/configuracion"
                      onClick={handleLinkClick}
                      className="text-gray-700 bg-white hover:bg-gray-50 hover:text-gray-900 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                    >
                      Configuración
                    </Link>
                    <Link
                      href="/perfiles/mispublicaciones"
                      onClick={handleLinkClick}
                      className="text-gray-700 bg-white hover:bg-gray-50 hover:text-gray-900 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                    >
                      Administrar mis publicaciones
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="text-red-600 bg-white hover:bg-red-50 px-3 py-2 rounded-md text-base font-medium text-left transition-colors duration-200 w-full"
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                ) : (
                  <Link 
                    href="/login" 
                    onClick={handleLinkClick}
                    className="block w-full"
                  >
                    <Button variant="outline" className="w-full">
                      Iniciar Sesión
                    </Button>
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
};

export default Navbar;