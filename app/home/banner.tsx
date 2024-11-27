export const Banner = () => {
  return (
    <div className="flex flex-col lg:flex-row items-center bg-[#612C7D] text-white px-8 lg:px-16 mb-8" style={{ height: '300px' }}>
      {/* Columna izquierda: Imagen y subtítulo */}
      <div className="lg:w-1/2 mb-4 lg:mb-0 flex flex-col items-center lg:items-start">
        <img
          src={`${process.env.NEXT_PUBLIC_ASSET_URL}/logoBlanco.png`}
          alt="Logo Axotl"
          className="w-full h-auto max-w-xs mb-2"
        />
        <p className="text-xs lg:text-sm text-left opacity-80">
          Tu plataforma de divulgación de publicaciones científicas y académicas
        </p>
      </div>

      {/* Columna derecha: Título y subtítulo principal */}
      <div className="lg:w-1/2 text-center lg:text-left">
        <h1 className="text-4xl font-bold">Bienvenido a Axotl Xires</h1>
        <p className="text-xl mt-4">
          Descubre las publicaciones científicas y académicas más relevantes del momento, por la comunidad y para la comunidad.
        </p>
      </div>
    </div>
  );
};
