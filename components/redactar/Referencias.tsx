// components/redactar/Referencias.tsx
interface ReferenciasProps {
    referencias: string;
    setReferencias: (refs: string) => void;
  }
  
  export const Referencias: React.FC<ReferenciasProps> = ({
    referencias,
    setReferencias,
  }) => {
    return (
      <div>
        <h2 className="text-xl font-semibold text-gray-700 mb-6">
          Fuentes de consulta
        </h2>
        <textarea
          value={referencias}
          onChange={(e) => setReferencias(e.target.value)}
          rows={5}
          placeholder="Ingresa tus referencias aquí"
          className="w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
      </div>
    );
  };