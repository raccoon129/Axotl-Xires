'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AuthGuard } from '@/components/autenticacion/AuthGuard';
import LoaderAxotl from '@/components/global/LoaderAxotl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import Tooltip from '@/components/global/Tooltip';

import { useAuth } from '@/hooks/useAuth';
import { 
  ArrowLeft, 
  FileText, 
  Edit, 
  CheckCircle, 
  X, 
  Clock, 
  MessageCircle, 
  Users, 
  Calendar as CalendarIcon, 
  Eye,
  User
} from 'lucide-react';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
// Tipos para la respuesta de la API
interface Comentario {
  id_comentario: number;
  contenido: string;
  fecha_creacion: string;
  fecha_comentario_formateada: string;
  autor_comentario: string;
  id_usuario: number;
}

interface Revision {
  id_revision: number;
  aprobado: boolean | null;
  fecha_creacion: string;
  fecha_revision_formateada: string;
  detalle_revision: string;
  descripcion_revision?: string;
  revisor: string;
  id_revisor: number;
  comentarios: Comentario[];
  total_comentarios?: number;
}

interface CicloRevision {
  ciclo: number;
  revisiones: number;
  fecha_inicio: string;
  fecha_fin: string;
  resultado: 'aprobado' | 'rechazado' | 'solicita_cambios' | 'en_revision';
}

interface Estadisticas {
  total_revisiones: number;
  iteraciones_completas: number;
  revisiones_aprobadas: number;
  revisiones_rechazadas: number;
  revisiones_con_cambios: number;
  tiempo_promedio_entre_ciclos: number;
  tiempo_total_revision_dias: number;
  tiempo_primera_revision_dias: number;
}

interface Publicacion {
  id_publicacion: number;
  titulo: string;
  resumen?: string;
  estado: string;
  tipo_publicacion?: string;
  autor?: string;
  fecha_creacion?: string;
  fecha_creacion_formateada?: string;
  imagen_portada?: string;
}

interface DatosRevision {
  publicacion: Publicacion;
  revisiones: Revision[];
  estadisticas: Estadisticas;
  ciclos_revision: CicloRevision[];
}

const HistorialRevisionesPage = () => {
  const params = useParams();
  const idPublicacion = params.idPublicacion as string;
  const router = useRouter();
  const { idUsuario } = useAuth();
  
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [datos, setDatos] = useState<DatosRevision | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Formatear fecha legible
  const formatearFecha = (fechaStr: string): string => {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Formatear duración en días
  const formatearDias = (dias: number): string => {
    if (dias === 0) return 'Mismo día';
    if (dias < 1) {
      const horas = Math.round(dias * 24);
      return `${horas} ${horas === 1 ? 'hora' : 'horas'}`;
    }
    return `${dias.toFixed(1)} ${dias === 1 ? 'día' : 'días'}`;
  };
  
  useEffect(() => {
    if (idPublicacion && idUsuario) {
      document.title = 'Historial de Revisiones - Axotl Xires';
      cargarHistorialRevisiones();
    }
  }, [idPublicacion, idUsuario]);
  
  const cargarHistorialRevisiones = async () => {
    try {
      setCargando(true);
      const token = localStorage.getItem('token');
      
      const respuesta = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/revision/publicacion/${idPublicacion}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      const datosRespuesta = await respuesta.json();
      
      if (!respuesta.ok) {
        throw new Error(datosRespuesta.mensaje || 'Error al cargar el historial de revisiones');
      }
      
      // Obtenemos los datos detallados de la publicación con revisiones y comentarios
      const datosPublicacion = datosRespuesta.datos;
      
      // Ahora obtenemos las estadísticas y ciclos
      const respuestaEstadisticas = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/revision/estadisticas/${idPublicacion}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      const datosEstadisticas = await respuestaEstadisticas.json();
      
      if (!respuestaEstadisticas.ok) {
        throw new Error(datosEstadisticas.mensaje || 'Error al cargar las estadísticas');
      }
      
      // Combinamos los datos de ambas respuestas
      const datosCombinados = {
        publicacion: datosPublicacion.publicacion,
        revisiones: datosPublicacion.revisiones,
        estadisticas: datosEstadisticas.datos.estadisticas,
        ciclos_revision: datosEstadisticas.datos.ciclos_revision || []
      };
      
      setDatos(datosCombinados);
      
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setCargando(false);
    }
  };
  
  const manejarEditar = () => {
    router.push(`/perfiles/mispublicaciones/editar/${idPublicacion}`);
  };

  const manejarVistaPrevia = () => {
    router.push(`/perfiles/mispublicaciones/previsualizar/${idPublicacion}`);
  };
  
  const volver = () => {
    router.push('/perfiles/mispublicaciones');
  };
  
  const obtenerColorEstado = (estado: string | undefined) => {
    if (!estado) return 'bg-gray-100 text-gray-700';
    
    const colores: {[key: string]: string} = {
      borrador: 'bg-gray-100 text-gray-700',
      en_revision: 'bg-yellow-100 text-yellow-700',
      publicado: 'bg-green-100 text-green-700',
      rechazado: 'bg-red-100 text-red-700',
      solicita_cambios: 'bg-orange-100 text-orange-700',
      aprobado: 'bg-green-100 text-green-700'
    };
    
    return colores[estado] || 'bg-gray-100 text-gray-700';
  };
  
  const obtenerIconoResultado = (resultado: string) => {
    switch (resultado) {
      case 'aprobado':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'rechazado':
        return <X size={16} className="text-red-600" />;
      case 'solicita_cambios':
        return <Clock size={16} className="text-orange-600" />;
      case 'en_revision':
      default:
        return <Clock size={16} className="text-yellow-600" />;
    }
  };
  
  if (cargando) {
    return <LoaderAxotl />;
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-red-700 mb-4">
          <p>{error}</p>
        </div>
        <Button onClick={volver} variant="outline" className="flex items-center gap-2">
          <ArrowLeft size={16} />
          Volver a mis publicaciones
        </Button>
      </div>
    );
  }
  
  return (
    <AuthGuard>
      <div className="container mx-auto px-4 md:px-6 lg:px-8 xl:px-12 max-w-7xl py-8">
        {/* Banner superior */}
        <div className="mb-6 flex items-center">
          <Tooltip message="Aquí puedes ver todas las revisiones y comentarios de tu publicación a través del tiempo.">
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-700 cursor-help">
              Historial de Revisiones
            </h1>
          </Tooltip>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Columna 1: Detalles de la publicación */}
          <div className="lg:col-span-3">
            <div className="sticky top-24 space-y-6">
              {/* Portada con skeleton */}
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="aspect-[612/792] relative">
                  {!imageLoaded && (
                    <div className="absolute inset-0 w-full h-full bg-gray-200 animate-pulse"></div>
                  )}
                  <img
                    src={datos?.publicacion.imagen_portada ? 
                      `${process.env.NEXT_PUBLIC_PORTADAS_URL}/${datos.publicacion.imagen_portada}` :
                      `${process.env.NEXT_PUBLIC_ASSET_URL}/defaultCover.gif`
                    }
                    alt={datos?.publicacion.titulo}
                    className="w-full h-full object-cover transition-opacity duration-300"
                    style={{ opacity: imageLoaded ? 1 : 0 }}
                    onLoad={() => setImageLoaded(true)}
                    onError={() => setImageLoaded(true)}
                  />
                </div>
              </div>

              {/* Detalles de la publicación */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Detalles de Publicación</CardTitle>
                  <CardDescription>
                    {datos?.publicacion.tipo_publicacion || 'Publicación'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    {datos?.publicacion.titulo}
                  </h2>
                  
                  {datos?.publicacion.resumen && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {datos.publicacion.resumen}
                    </p>
                  )}
                  
                  <div className="space-y-3 mb-6">
                    <div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                        obtenerColorEstado(datos?.publicacion.estado)
                      }`}>
                        {datos?.publicacion.estado === 'solicita_cambios' 
                          ? 'Cambios Solicitados' 
                          : datos?.publicacion.estado === 'en_revision'
                            ? 'En Revisión'
                            : datos?.publicacion.estado === 'borrador'
                              ? 'Borrador'
                              : datos?.publicacion.estado === 'aprobado'
                                ? 'Aprobado'
                                : datos?.publicacion.estado === 'rechazado'
                                  ? 'Rechazado'
                                  : datos?.publicacion.estado === 'publicado'
                                    ? 'Publicado'
                                    : datos?.publicacion.estado}
                      </span>
                    </div>
                    
                    {datos?.publicacion.autor && (
                      <div className="flex items-center gap-2">
                        <Users size={14} className="text-gray-500" />
                        <span className="text-sm text-gray-700">{datos.publicacion.autor}</span>
                      </div>
                    )}
                    
                    {datos?.publicacion.fecha_creacion && (
                      <div className="flex items-center gap-2">
                        <CalendarIcon size={14} className="text-gray-500" />
                        <span className="text-sm text-gray-700">
                          {datos.publicacion.fecha_creacion_formateada || formatearFecha(datos.publicacion.fecha_creacion)}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Botones de acciones */}
                  <div className="space-y-2">
                    {datos?.publicacion.estado === 'solicita_cambios' && (
                      <Button 
                        onClick={manejarEditar}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700"
                      >
                        <Edit size={16} />
                        Editar publicación
                      </Button>
                    )}
                    
                    <Button 
                      variant="outline" 
                      onClick={manejarVistaPrevia}
                      className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-50"
                    >
                      <Eye size={16} />
                      Ver vista previa
                    </Button>
                    
                    <Button 
                      onClick={volver} 
                      variant="outline" 
                      className="w-full flex items-center justify-center gap-2"
                    >
                      <ArrowLeft size={16} />
                      Volver a mis publicaciones
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Columna 2: Lista de revisiones */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Revisiones y Comentarios</h2>
              
              {datos?.revisiones && datos.revisiones.length === 0 ? (
                <p className="text-gray-500 italic text-center py-8">
                  No hay revisiones disponibles para esta publicación.
                </p>
              ) : (
                <div className="space-y-6">
                  {/* Revisión más reciente (Actual) */}
                  {datos?.revisiones && datos.revisiones.length > 0 && (
                    <Card className="border-l-4 border-l-blue-500">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-base flex items-center gap-2">
                              <span className="text-gray-800">{datos.revisiones[0].detalle_revision}</span>
                              
                              <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                                Actual
                              </Badge>
                              
                              {datos.revisiones[0].aprobado === true && (
                                <Badge className="bg-green-100 text-green-700 border-green-200">
                                  <CheckCircle size={12} className="mr-1" />
                                  Aprobada
                                </Badge>
                              )}
                              
                              {datos.revisiones[0].aprobado === false && (
                                <Badge className="bg-red-100 text-red-700 border-red-200">
                                  <X size={12} className="mr-1" />
                                  Rechazada
                                </Badge>
                              )}
                              
                              {datos.revisiones[0].aprobado === null && (
                                <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-100 hover:text-orange-700">
                                  <Clock size={12} className="mr-1" />
                                  Solicita cambios
                                </Badge>
                              )}
                            </CardTitle>
                            
                            <CardDescription className="flex items-center gap-1 mt-1">
                              <CalendarIcon size={12} />
                              <span>{datos.revisiones[0].fecha_revision_formateada || formatearFecha(datos.revisiones[0].fecha_creacion)}</span>
                            </CardDescription>
                          </div>
                          
                          <div className="flex items-center gap-1 text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded">
                            <User size={14} />
                            <span>{datos.revisiones[0].revisor}</span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {/* Descripción de la revisión */}
                        {datos.revisiones[0].descripcion_revision && (
                          <div className="mb-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <p className="text-sm text-gray-700">
                              {datos.revisiones[0].descripcion_revision}
                            </p>
                          </div>
                        )}

                        {/* Comentarios */}
                        {datos.revisiones[0].comentarios && datos.revisiones[0].comentarios.length > 0 ? (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 mb-2">
                              <MessageCircle size={16} className="text-blue-500" />
                              <h4 className="font-medium text-sm text-blue-700">Comentario</h4>
                            </div>
                            
                            {datos.revisiones[0].comentarios.map((comentario) => (
                              <div 
                                key={comentario.id_comentario} 
                                className="bg-blue-50 rounded-lg p-3 border border-blue-200"
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex items-center gap-1 text-xs font-medium text-blue-700">
                                    <User size={12} />
                                    {comentario.autor_comentario}
                                  </div>
                                  <span className="text-xs text-gray-500">
                                    {comentario.fecha_comentario_formateada || formatearFecha(comentario.fecha_creacion)}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-700">{comentario.contenido}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500 italic border border-dashed border-gray-200 p-3 rounded-lg text-center">
                            No hay comentarios en esta revisión.
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Historial de revisiones (Acordeón) */}
                  {datos?.revisiones && datos.revisiones.length > 1 && (
                    <div className="mt-8">
                      <h3 className="text-lg font-medium text-gray-700 mb-3">Historial de revisiones</h3>
                      <div className="space-y-3">
                        {datos.revisiones.slice(1).map((revision) => (
                          <Accordion 
                            type="single" 
                            collapsible 
                            key={revision.id_revision}
                            className="border rounded-md"
                          >
                            <AccordionItem value="item-1" className="border-none">
                              <AccordionTrigger className="px-4 py-3 hover:bg-gray-50">
                                <div className="flex items-center gap-2 text-left">
                                  <span className="text-sm font-medium">{revision.detalle_revision}</span>
                                  
                                  {revision.aprobado === true && (
                                    <Badge className="bg-green-100 text-green-700 border-green-200">
                                      <CheckCircle size={12} className="mr-1" />
                                      Aprobada
                                    </Badge>
                                  )}
                                  
                                  {revision.aprobado === false && (
                                    <Badge className="bg-red-100 text-red-700 border-red-200">
                                      <X size={12} className="mr-1" />
                                      Rechazada
                                    </Badge>
                                  )}
                                  
                                  {revision.aprobado === null && (
                                    <Badge className="bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-100 hover:text-orange-700">
                                      <Clock size={12} className="mr-1" />
                                      Solicita cambios
                                    </Badge>
                                  )}
                                  
                                  <span className="text-xs text-gray-500 ml-auto">
                                    {revision.fecha_revision_formateada || formatearFecha(revision.fecha_creacion)}
                                  </span>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="px-4 pb-4">
                                <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
                                  <User size={14} />
                                  <span>Revisado por: {revision.revisor}</span>
                                </div>
                                
                                {/* Descripción de la revisión */}
                                {revision.descripcion_revision && (
                                  <div className="mb-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    <p className="text-sm text-gray-700">
                                      {revision.descripcion_revision}
                                    </p>
                                  </div>
                                )}

                                {/* Comentarios */}
                                {revision.comentarios && revision.comentarios.length > 0 ? (
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2 mb-2">
                                      <MessageCircle size={16} className="text-blue-500" />
                                      <h4 className="font-medium text-sm text-blue-700">Comentario</h4>
                                    </div>
                                    
                                    {revision.comentarios.map((comentario) => (
                                      <div 
                                        key={comentario.id_comentario} 
                                        className="bg-blue-50 rounded-lg p-3 border border-blue-200"
                                      >
                                        <div className="flex items-start justify-between mb-2">
                                          <div className="flex items-center gap-1 text-xs font-medium text-blue-700">
                                            <User size={12} />
                                            {comentario.autor_comentario}
                                          </div>
                                          <span className="text-xs text-gray-500">
                                            {comentario.fecha_comentario_formateada || formatearFecha(comentario.fecha_creacion)}
                                          </span>
                                        </div>
                                        <p className="text-sm text-gray-700">{comentario.contenido}</p>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-sm text-gray-500 italic border border-dashed border-gray-200 p-3 rounded-lg text-center">
                                    No hay comentarios en esta revisión.
                                  </div>
                                )}
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Columna 3: Línea de tiempo y estadísticas */}
          <div className="lg:col-span-4">
            {/* Estadísticas */}
            <Card className="mb-6">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Estadísticas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-blue-700 font-bold text-2xl">
                      {datos?.estadisticas?.total_revisiones || 0}
                    </span>
                    <span className="text-xs text-blue-600 text-center">
                      Revisiones Totales
                    </span>
                  </div>
                  
                  <div className="flex flex-col items-center p-3 bg-purple-50 rounded-lg">
                    <span className="text-purple-700 font-bold text-2xl">
                      {datos?.estadisticas?.iteraciones_completas || 0}
                    </span>
                    <span className="text-xs text-purple-600 text-center">
                      Ciclos Completados
                    </span>
                  </div>
                  
                  <div className="flex flex-col items-center p-3 bg-orange-50 rounded-lg">
                    <span className="text-orange-700 font-bold text-2xl">
                      {datos?.estadisticas?.revisiones_con_cambios || 0}
                    </span>
                    <span className="text-xs text-orange-600 text-center">
                      Solicitud de Cambios
                    </span>
                  </div>
                  
                  <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700 font-bold text-2xl">
                      {datos?.estadisticas?.tiempo_total_revision_dias 
                        ? formatearDias(datos.estadisticas.tiempo_total_revision_dias) 
                        : '0 días'}
                    </span>
                    <span className="text-xs text-gray-600 text-center">
                      Tiempo Total
                    </span>
                  </div>
                </div>
                
                {datos?.estadisticas && datos.estadisticas.tiempo_promedio_entre_ciclos > 0 && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">Tiempo promedio entre ciclos:</span>
                      <span className="text-sm font-medium text-gray-800">
                        {formatearDias(datos.estadisticas.tiempo_promedio_entre_ciclos)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Primera revisión realizada en:</span>
                      <span className="text-sm font-medium text-gray-800">
                        {formatearDias(datos.estadisticas.tiempo_primera_revision_dias)}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Línea de tiempo simplificada */}
            {datos?.ciclos_revision && datos.ciclos_revision.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Línea de Tiempo</CardTitle>
                  <CardDescription>Historial de ciclos de revisión</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative pl-6">
                    {/* Línea vertical continua */}
                    <div className="absolute left-2.5 top-0 bottom-0 w-[1px] bg-gray-200"></div>
                    
                    <div className="space-y-5 relative">
                      {/* Mostramos los ciclos con el más reciente arriba */}
                      {[...datos.ciclos_revision].reverse().map((ciclo) => {
                        // Estado simplificado
                        const estado = 
                          ciclo.resultado === 'solicita_cambios' ? 'Cambios solicitados' :
                          ciclo.resultado === 'aprobado' ? 'Aprobado' :
                          ciclo.resultado === 'rechazado' ? 'Rechazado' : 'En revisión';
                        
                        // Color según estado
                        const colorEstado = 
                          ciclo.resultado === 'solicita_cambios' ? 'text-orange-600 bg-orange-50 border-orange-200' :
                          ciclo.resultado === 'aprobado' ? 'text-green-600 bg-green-50 border-green-200' :
                          ciclo.resultado === 'rechazado' ? 'text-red-600 bg-red-50 border-red-200' : 
                          'text-blue-600 bg-blue-50 border-blue-200';
                        
                        // Cálculo de duración
                        const duracion = 
                          new Date(ciclo.fecha_fin).getTime() - new Date(ciclo.fecha_inicio).getTime() > 0
                            ? formatearDias((new Date(ciclo.fecha_fin).getTime() - new Date(ciclo.fecha_inicio).getTime()) / (1000 * 60 * 60 * 24))
                            : 'Mismo día';
                        
                        return (
                          <div key={ciclo.ciclo} className="relative">
                            {/* Marcador circular simple */}
                            <div className="absolute left-[-18px] top-1 w-4 h-4 rounded-full border bg-white z-10 border-gray-400"></div>
                            
                            {/* Contenido simple */}
                            <div className="bg-white rounded-md">
                              <div className="flex items-center gap-3">
                                <span className="text-lg font-semibold text-gray-700">{ciclo.ciclo}</span>
                                <Badge className={`${colorEstado}`}>
                                  {estado}
                                </Badge>
                              </div>
                              
                              <div className="mt-2 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                  <CalendarIcon size={14} /> 
                                  {formatearFecha(ciclo.fecha_inicio).split(' ')[0]} 
                                  <span className="text-gray-400">→</span>
                                  {formatearFecha(ciclo.fecha_fin).split(' ')[0]}
                                </div>
                                
                                <div className="flex items-center justify-between mt-1">
                                  <div className="flex items-center gap-1">
                                    <Clock size={14} /> 
                                    <span>{duracion}</span>
                                  </div>
                                  
                                  <span className="text-xs text-gray-500">
                                    {ciclo.revisiones} revisión{ciclo.revisiones !== 1 ? 'es' : ''}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
};

export default HistorialRevisionesPage;