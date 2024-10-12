import Link from 'next/link';
import { Linkedin, Instagram, Facebook } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white text-gray-800 shadow-md mt-8">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-2">Axotl Xires Publicaciones</h3>
            <h4 className="text-lg mb-4">Plataforma para la divulgación de artículos científicos y académicos.</h4>
          </div>
          <div className="flex flex-col space-y-2">
            <Link href="/terminos" className="hover:text-purple-600">Términos y condiciones</Link>
            <Link href="/contacto" className="hover:text-purple-600">Contacto</Link>
            <Link href="/copyright" className="hover:text-purple-600">Copyright</Link>
            <Link href="/acerca-de" className="hover:text-purple-600">Acerca de</Link>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Encuéntranos en redes sociales:</h4>
            <div className="flex space-x-4">
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-purple-600">
                <Linkedin size={24} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-purple-600">
                <Instagram size={24} />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-purple-600">
                <Facebook size={24} />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-200 text-center">
          <p>Axotl Xires Publicaciones © 2024 - Algunos derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;