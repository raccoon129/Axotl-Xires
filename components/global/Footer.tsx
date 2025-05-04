import Link from "next/link";
import { Linkedin, Instagram, Facebook } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-white text-gray-800 shadow-md mt-60">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-2">
              Axotl Xires Publicaciones
            </h3>
            <h4 className="text-lg mb-4">
              Plataforma para la divulgación y redacción de artículos científicos y
              académicos.
            </h4>
            <h6>Beta 0.0.0</h6>
          </div>
          <div className="flex flex-col space-y-2">
            <Link href="https://ayuda.axotl.org/terminos-condiciones" className="hover:text-purple-600">
              Términos y Condiciones
            </Link>
            <Link href="https://ayuda.axotl.org/contacto" className="hover:text-purple-600">
              Contacto
            </Link>
            <Link href="https://ayuda.axotl.org/copyright" className="hover:text-purple-600">
              Copyright
            </Link>
            <Link href="https://ayuda.axotl.org/nosotros" className="hover:text-purple-600">
              Sobre Nosotros
            </Link>
            <Link href="https://ayuda.axotl.org/acerca-de" className="hover:text-purple-600">
              Acerca de
            </Link>
            <Link
              href="https://ayuda.axotl.org"
              className="hover:text-purple-600"
            >
              Ayuda
            </Link>
            <Link
              href="https://buymeacoffee.com/axotlpublicaciones"
              className="hover:text-purple-600"
            >
              Donaciones
            </Link>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">
              Encuéntranos en redes sociales:
            </h4>
            <div className="flex space-x-4">
              <a
                href="https://www.linkedin.com/company/axotl-xires/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-purple-600"
              >
                <Linkedin size={24} />
              </a>
              <a
                href="https://instagram.com/axotl-xires"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-purple-600"
              >
                <Instagram size={24} />
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61569988029422"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-purple-600"
              >
                <Facebook size={24} />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-200 text-center">
          <p>Axotl Xires Publicaciones © 2024 - 2025 - Derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
