/**
 * Hook personalizado para gestionar los estilos de la portada
 * Maneja la selección y aplicación de estilos, así como sus configuraciones
 */

import { useState, useCallback } from 'react';
import { 
  ConfiguracionEstilo, 
  TipoEstilo,
  ElementoTexto
} from '../typesGeneradorPortada';
import { obtenerConfiguracionEstilo } from '../configuraciones/configuracionesEstilos';
import { configuracionesTextoPorEstilo } from '../configuraciones/configuracionesTexto';
import { EstiloPortada, obtenerFuncionEstilo } from '../estilos';

interface PropiedadesUseEstilos {
  estiloInicial?: TipoEstilo;
  onEstiloChange?: (estilo: TipoEstilo, elementosTexto?: ElementoTexto[]) => void;
}

export const useEstilos = ({ estiloInicial = 'clasico', onEstiloChange }: PropiedadesUseEstilos = {}) => {
  // Estado para el estilo actual y su configuración
  const [estiloActual, setEstiloActual] = useState<TipoEstilo>(estiloInicial);
  const [configuracion, setConfiguracion] = useState<ConfiguracionEstilo>(
    obtenerConfiguracionEstilo(estiloInicial)
  );

  /**
   * Cambia el estilo actual y actualiza su configuración
   */
  const cambiarEstilo = useCallback((nuevoEstilo: TipoEstilo) => {
    setEstiloActual(nuevoEstilo);
    setConfiguracion(obtenerConfiguracionEstilo(nuevoEstilo));
    
    // Generar elementos de texto con la configuración predeterminada del nuevo estilo
    const configTexto = configuracionesTextoPorEstilo[nuevoEstilo];
    
    // Llamar al callback con el nuevo estilo y los elementos de texto predeterminados
    onEstiloChange?.(nuevoEstilo);
  }, [onEstiloChange]);

  /**
   * Actualiza la configuración del estilo actual
   */
  const actualizarConfiguracion = useCallback((nuevaConfiguracion: ConfiguracionEstilo) => {
    setConfiguracion(nuevaConfiguracion);
  }, []);

  /**
   * Obtiene la configuración de texto predeterminada para el estilo actual
   */
  const obtenerConfiguracionTexto = useCallback((elementoId: string): Partial<ElementoTexto> => {
    const configEstilo = configuracionesTextoPorEstilo[estiloActual];
    return elementoId === 'titulo' ? configEstilo.titulo : configEstilo.autor;
  }, [estiloActual]);

  /**
   * Obtiene la función de renderizado para el estilo actual
   */
  const obtenerRenderizador = useCallback(() => {
    return obtenerFuncionEstilo(estiloActual);
  }, [estiloActual]);

  /**
   * Genera elementos de texto con la configuración predeterminada del estilo actual
   * pero manteniendo el contenido del texto
   */
  const generarElementosTextoParaEstilo = useCallback((
    textoTitulo: string,
    textoAutor: string
  ): ElementoTexto[] => {
    const configEstilo = configuracionesTextoPorEstilo[estiloActual];
    
    return [
      {
        id: 'titulo',
        texto: textoTitulo,
        ...configEstilo.titulo
      } as ElementoTexto,
      {
        id: 'autor',
        texto: textoAutor,
        ...configEstilo.autor
      } as ElementoTexto
    ];
  }, [estiloActual]);

  return {
    estiloActual,
    configuracion,
    cambiarEstilo,
    actualizarConfiguracion,
    obtenerConfiguracionTexto,
    obtenerRenderizador,
    generarElementosTextoParaEstilo
  };
}; 