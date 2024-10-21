"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Menu, X, Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth"; // Importamos el hook de autenticación

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const router = useRouter();

  // Usamos el hook useAuth para obtener el estado de autenticación
  const { isLoggedIn, userName } = useAuth();

  const handleLogout = () => {
    // Aquí iría la lógica para cerrar sesión (por ejemplo, limpiar el token).
    localStorage.removeItem('token'); // Limpiar el token del almacenamiento local
    router.push("/login");
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo y Texto */}
          <Link href="/" className="flex-shrink-0 flex items-center">
            <Image
              src="https://drift3.alwaysdata.net/axotlxires/logoMorado2.png"
              alt="Axotl Xires Logo"
              width={60}
              height={60}
              className="transition-transform duration-300 hover:scale-110"
            />
            <span className="ml-2 text-2xl font-bold text-gray-800">
              Axotl.org
            </span>
          </Link>

          {/* Enlaces de navegación alineados a la izquierda */}
          <div className="hidden sm:flex sm:items-center ml-8 space-x-4">
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

          {/* Barra de búsqueda y botones de sesión/usuario */}
          <div className="hidden sm:flex sm:items-center">
            <div className="relative">
              <Input
                type="text"
                placeholder="Busca algo interesante"
                className="w-64 pl-10 pr-4 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
            </div>

            {isLoggedIn ? (
              <div className="relative ml-4 flex items-center space-x-4">
                {/* Botón de notificaciones */}
                <div
                  className="relative cursor-pointer"
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                >
                  <Bell className="h-6 w-6 text-gray-600" />
                  {isNotificationsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg p-4"
                    >
                      <p className="text-gray-500 text-sm">No tienes notificaciones</p>
                    </motion.div>
                  )}
                </div>

                {/* Botón de menú del usuario */}
                <div
                  className="relative cursor-pointer"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                >
                  <User className="h-8 w-8 p-1 rounded-full bg-gray-200 text-gray-600" />
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg"
                    >
                      <div className="p-4">
                        <p className="text-gray-800 font-semibold">
                          Hola, {userName}
                        </p>
                        <Link
                          href="/perfil"
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
                          href="/admin"
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
                </div>
              </div>
            ) : (
              <Link className="ml-4" href="/login" passHref>
                <Button variant="outline">Iniciar Sesión</Button>
              </Link>
            )}
          </div>

          {/* Botón de menú en dispositivos móviles */}
          <div className="-mr-2 flex items-center sm:hidden">
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

      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="sm:hidden"
        >
          <div className="pt-2 pb-3 space-y-1">
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
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-4">
              <Input
                type="text"
                placeholder="Busca algo interesante"
                className="w-full pl-10 pr-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </nav>
  );
};

export default Navbar;
