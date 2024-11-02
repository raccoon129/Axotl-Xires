// components/Navbar.tsx
// Se añade en la mayoría de páginas para la navegación 

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Menu, X, Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const router = useRouter();

  const { isLoggedIn, userName } = useAuth();

  useEffect(() => {
    const checkAuth = async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
      setIsAuthChecking(false);
    };
    checkAuth();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push("/");
  };

  // Componente para los botones de autenticación con layout fijo
  const AuthButtons = () => {
    return (
      <div className="ml-4 w-32 h-10 flex items-center justify-end">
        {isAuthChecking ? (
          <Skeleton className="w-full h-9" />
        ) : isLoggedIn ? (
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <Bell className="h-5 w-5 text-gray-600" />
              </button>
              <AnimatePresence>
                {isNotificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50"
                  >
                    <p className="text-gray-500 text-sm">No tienes notificaciones</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2"
              >
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="h-5 w-5 text-gray-600" />
                </div>
              </button>
              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
                  >
                    <div className="p-4">
                      <p className="text-gray-800 font-semibold truncate">
                        Hola, {userName}
                      </p>
                      <Link
                        href="/perfiles"
                        className="block mt-2 text-sm text-gray-600 hover:bg-gray-100 px-2 py-1 rounded-md"
                      >
                        Mi perfil
                      </Link>
                      <Link
                        href="/configuracion"
                        className="block mt-2 text-sm text-gray-600 hover:bg-gray-100 px-2 py-1 rounded-md"
                      >
                        Configuración
                      </Link>
                      <Link
                        href="/publicaciones"
                        className="block mt-2 text-sm text-gray-600 hover:bg-gray-100 px-2 py-1 rounded-md"
                      >
                        Administrar publicaciones
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left text-red-600 font-semibold mt-4 px-2 py-1 hover:bg-red-50 rounded-md"
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
            <Button variant="outline" className="w-full">
              Iniciar Sesión
            </Button>
          </Link>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Espacio reservado para el navbar */}
      <div className="h-20"></div>
      
      {/* Navbar fijo */}
      <nav className="bg-white shadow-md fixed top-0 left-0 right-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-20">
            {/* Logo y texto - ancho fijo */}
            <div className="flex-shrink-0 w-48 flex items-center">
              <Link href="/" className="flex items-center">
                <Image
                  src={`${process.env.NEXT_PUBLIC_ASSET_URL}/logoMorado2.png`}
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
                  className="text-gray-700 hover:text-gray-900 px-2 py-2 rounded-md text-sm font-medium"
                >
                  Explorar
                </Link>
                <Link
                  href="/categorias"
                  className="text-gray-700 hover:text-gray-900 px-2 py-2 rounded-md text-sm font-medium"
                >
                  Categorías
                </Link>
                <Link
                  href="/redactar"
                  className="text-gray-700 hover:text-gray-900 px-2 py-2 rounded-md text-sm font-medium"
                >
                  Redactar
                </Link>
              </div>
            </div>

            {/* Barra de búsqueda y autenticación - ancho fijo */}
            <div className="hidden sm:flex items-center w-96 justify-end">
              <div className="relative w-64">
                <Input
                  type="text"
                  placeholder="Busca algo interesante"
                  className="w-full pl-10 pr-4 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
              </div>
              <AuthButtons />
            </div>

            {/* Botón de menú móvil - ancho fijo */}
            <div className="sm:hidden flex items-center justify-end w-12">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500"
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
                  href="/explorar"
                  className="text-gray-700 hover:bg-gray-50 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
                >
                  Explorar
                </Link>
                <Link
                  href="/categorias"
                  className="text-gray-700 hover:bg-gray-50 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
                >
                  Categorías
                </Link>
                <Link
                  href="/redactar"
                  className="text-gray-700 hover:bg-gray-50 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
                >
                  Redactar
                </Link>
              </div>
              <div className="pt-4 pb-3 border-t border-gray-200 px-4">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Busca algo interesante"
                    className="w-full pl-10 pr-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
                <div className="mt-3">
                  {isLoggedIn ? (
                    <div className="flex flex-col space-y-2">
                      <Link
                        href="/perfiles"
                        className="text-gray-700 hover:bg-gray-50 hover:text-gray-900 px-3 py-2 rounded-md text-base font-medium"
                      >
                        Mi perfil
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="text-red-600 hover:bg-red-50 px-3 py-2 rounded-md text-base font-medium text-left"
                      >
                        Cerrar Sesión
                      </button>
                    </div>
                  ) : (
                    <Link href="/login" passHref>
                      <Button variant="outline" className="w-full">
                        Iniciar Sesión
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
};

export default Navbar;