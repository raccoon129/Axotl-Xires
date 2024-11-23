'use client';

import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import OverlayEnvio from './OverlayEnvio';
import Tooltip from "@/components/global/Tooltip";
import { motion } from 'framer-motion';

interface PropiedadesBoton {
  idBorradorActual: number | null;
  onEnviar: () => Promise<{ exito: boolean }>;
  className?: string;
  habilitado: boolean;
  camposCompletos: boolean;
}

const BotonEnviarParaRevision = ({ 
  idBorradorActual, 
  onEnviar,
  className = "",
  habilitado = false,
  camposCompletos = false
}: PropiedadesBoton) => {
  const [dialogoAbierto, setDialogoAbierto] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [mostrarOverlay, setMostrarOverlay] = useState(false);
  const router = useRouter();

  const manejarEnvio = async () => {
    try {
      setEnviando(true);
      const resultado = await onEnviar();
      
      if (resultado.exito) {
        setMostrarOverlay(true);
        sessionStorage.setItem('enviadoARevision', 'true');
        
        // Esperar a que el overlay termine su animación
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Redirigir con un parámetro que indique el éxito
        router.push('/redactar/exito?enviado=true');
      }
    } catch (error) {
      console.error('Error al enviar para revisión:', error);
    } finally {
      setEnviando(false);
      setDialogoAbierto(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.3 }}
      >
        <Tooltip message="Si está todo listo, guarda una vez como borrador y envía para revisión">
          <Button
            onClick={() => setDialogoAbierto(true)}
            disabled={!habilitado || !idBorradorActual || enviando || !camposCompletos}
            className={`flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white ${
              !habilitado || !idBorradorActual || !camposCompletos ? 'opacity-50 cursor-not-allowed' : ''
            } ${className}`}
            title={
              !camposCompletos 
                ? "Completa todos los campos requeridos" 
                : !habilitado 
                  ? "Guarda el borrador primero" 
                  : "Enviar publicación para revisión"
            }
          >
            <Send className="w-4 h-4" />
            {enviando ? 'Enviando...' : 'Enviar para revisión'}
          </Button>
        </Tooltip>
      </motion.div>

      <AlertDialog open={dialogoAbierto} onOpenChange={setDialogoAbierto}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Enviar publicación para revisión?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción enviará tu publicación para ser revisada. Una vez enviada, no podrás 
              realizar más cambios hasta que sea revisada por el equipo editorial.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={enviando}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={manejarEnvio}
              disabled={enviando}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {enviando ? 'Enviando...' : 'Enviar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <OverlayEnvio mostrar={mostrarOverlay} />
    </>
  );
};

export default BotonEnviarParaRevision;
