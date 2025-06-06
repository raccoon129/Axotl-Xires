'use client';

import { motion } from 'framer-motion';
import { Publicacion } from '@/type/typePublicacion';

interface PropiedadesContenido {
  publicacion: Publicacion;
}

export function ContenidoPublicacion({ publicacion }: PropiedadesContenido) {
  return (
    <motion.article
      className="lg:col-span-7 bg-white shadow-lg rounded-lg overflow-hidden order-1 lg:order-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Portada móvil */}
      <div className="lg:hidden aspect-[16/9] relative overflow-hidden">
        <img
          src={
            publicacion?.imagen_portada
              ? `${process.env.NEXT_PUBLIC_API_URL}/api/publicaciones/${publicacion.id_publicacion}/portada`
              : `${process.env.NEXT_PUBLIC_ASSET_URL}/defaultCover.gif`
          }
          alt={publicacion?.titulo}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Título y resumen */}
      <header className="p-4 lg:p-8 border-b">
        <h1 className="text-2xl lg:text-4xl font-bold text-gray-900 mb-4 lg:mb-6 font-crimson">
          {publicacion?.titulo}
        </h1>
        <p className="text-lg lg:text-xl text-gray-600 font-crimson leading-relaxed">
          {publicacion?.resumen}
        </p>
      </header>

      {/* Contenido */}
      <div className="p-4 lg:p-8">
        <style jsx global>{`
          @import url("https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700&display=swap");

          .contenido-publicacion {
            font-family: "Crimson Text", serif;
            font-size: 1.125rem;
            line-height: 1.8;
            color: #1a1a1a;
          }

          .contenido-publicacion h1,
          .contenido-publicacion h2,
          .contenido-publicacion h3 {
            font-weight: 700;
            color: #111827;
            margin: 1.5em 0 0.5em;
          }

          .contenido-publicacion h1 {
            font-size: 2em;
          }
          .contenido-publicacion h2 {
            font-size: 1.75em;
          }
          .contenido-publicacion h3 {
            font-size: 1.5em;
          }

          .contenido-publicacion p {
            margin: 1em 0;
          }

          .contenido-publicacion img {
            max-width: 100%;
            height: auto;
            margin: 2em auto;
            border-radius: 0.5rem;
          }

          .contenido-publicacion a {
            color: #2563eb;
            text-decoration: underline;
          }

          .contenido-publicacion blockquote {
            border-left: 4px solid #e5e7eb;
            padding-left: 1em;
            margin: 1.5em 0;
            font-style: italic;
            color: #4b5563;
          }
        `}</style>
        <div
          className="contenido-publicacion"
          dangerouslySetInnerHTML={{ __html: publicacion?.contenido || "" }}
        />
      </div>

      {/* Referencias */}
      {publicacion?.referencias && (
        <footer className="p-4 lg:p-8 bg-gray-50 border-t">
          <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2 lg:mb-4 font-crimson">
            Fuentes de consulta
          </h2>
          <div className="prose max-w-none font-crimson">
            <pre className="whitespace-pre-wrap text-base lg:text-lg text-gray-600">
              {publicacion.referencias}
            </pre>
          </div>
        </footer>
      )}
    </motion.article>
  );
} 