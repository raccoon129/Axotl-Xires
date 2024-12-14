import { Button } from "@/components/ui/button";
import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface PropiedadesBotonMorado extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variante?: 'principal' | 'borde' | 'fantasma';
  cargando?: boolean;
  textoCarga?: string;
  className?: string;
  anchoCompleto?: boolean;
}

export default function BotonMorado({
  children,
  variante = 'principal',
  cargando = false,
  textoCarga = 'Cargando...',
  className = '',
  anchoCompleto = false,
  disabled,
  ...props
}: PropiedadesBotonMorado) {
  const estilosBase = "transition-colors duration-300";
  
  const estilosVariante = {
    principal: "bg-[#612c7d] hover:bg-[#4a2161] text-white",
    borde: "border-2 border-[#612c7d] text-[#612c7d] hover:bg-[#612c7d] hover:text-white",
    fantasma: "bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent hover:text-[#612c7d]"
  }[variante];
  
  const estilosAncho = anchoCompleto ? "w-full" : "";

  return (
    <Button
      {...props}
      disabled={cargando || disabled}
      className={cn(
        estilosBase,
        estilosVariante,
        estilosAncho,
        className
      )}
    >
      {cargando ? (
        <div className="flex items-center justify-center">
          <svg 
            className="animate-spin -ml-1 mr-3 h-5 w-5" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          {textoCarga}
        </div>
      ) : children}
    </Button>
  );
} 