'use client';

export const estilosContenido = `
  @import url('https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700&display=swap');
  
  .contenido-publicacion {
    font-family: 'Crimson Text', serif;
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

  .contenido-publicacion h1 { font-size: 2em; }
  .contenido-publicacion h2 { font-size: 1.75em; }
  .contenido-publicacion h3 { font-size: 1.5em; }

  .contenido-publicacion p { margin: 1em 0; }

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

  /* Estilos para el tema sepia */
  .tema-sepia {
    background-color: #f4f1ea;
    color: #5c4b37;
  }

  .tema-sepia .contenido-publicacion {
    color: #5c4b37;
  }

  .tema-sepia .contenido-publicacion h1,
  .tema-sepia .contenido-publicacion h2,
  .tema-sepia .contenido-publicacion h3 {
    color: #453121;
  }

  .tema-sepia .contenido-publicacion blockquote {
    border-color: #d3cbc1;
    color: #7a6555;
  }

  .tema-sepia .contenido-publicacion a {
    color: #8b6b4d;
  }
`; 