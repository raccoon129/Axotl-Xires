//Corregir las imagenes e información de los metadatos disponibles desde la API

'use client';

import Head from 'next/head';

interface SEOMetadataProps {
  titulo: string;
  descripcion: string;
  imagen?: string;
  autor?: string;
  fechaPublicacion?: string;
  tipoPublicacion?: string;
  url?: string;
}

const SEOMetadata: React.FC<SEOMetadataProps> = ({
  titulo,
  descripcion,
  imagen,
  autor,
  fechaPublicacion,
  tipoPublicacion,
  url
}) => {
  const sitioWeb = "Axotl Xires";
  const urlBase = process.env.NEXT_PUBLIC_SITE_URL || 'https://axotl.org';
  const urlCompleta = url ? `${urlBase}${url}` : urlBase;
  const imagenUrl = imagen || `${urlBase}/og-image.jpg`;

  return (
    <Head>
      {/* Metadatos básicos */}
      <title>{`${titulo} | ${sitioWeb}`}</title>
      <meta name="description" content={descripcion} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="article" />
      <meta property="og:title" content={titulo} />
      <meta property="og:description" content={descripcion} />
      <meta property="og:image" content={imagenUrl} />
      <meta property="og:url" content={urlCompleta} />
      <meta property="og:site_name" content={sitioWeb} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={titulo} />
      <meta name="twitter:description" content={descripcion} />
      <meta name="twitter:image" content={imagenUrl} />
      
      {/* Metadatos de artículo */}
      {autor && <meta property="article:author" content={autor} />}
      {fechaPublicacion && <meta property="article:published_time" content={fechaPublicacion} />}
      {tipoPublicacion && <meta property="article:section" content={tipoPublicacion} />}
      
      {/* Schema.org para Google */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": titulo,
          "description": descripcion,
          "image": imagenUrl,
          "author": {
            "@type": "Person",
            "name": autor
          },
          "publisher": {
            "@type": "Organization",
            "name": sitioWeb,
            "logo": {
              "@type": "ImageObject",
              "url": `${urlBase}/logo.png`
            }
          },
          "datePublished": fechaPublicacion,
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": urlCompleta
          }
        })}
      </script>
    </Head>
  );
};

export default SEOMetadata; 