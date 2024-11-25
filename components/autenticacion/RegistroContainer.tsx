'use client';

import { motion } from 'framer-motion';
import { BookOpen, Users, Share2, Star, BookMarked, Award } from 'lucide-react';

const caracteristicas = [
  {
    icon: <BookOpen className="w-8 h-8 text-[#612c7d]" />,
    titulo: "Acceso ilimitado",
    descripcion: "Lee y descarga publicaciones académicas sin restricciones"
  },
  {
    icon: <Users className="w-8 h-8 text-[#612c7d]" />,
    titulo: "Comunidad académica",
    descripcion: "Conecta con investigadores y estudiantes de todo el mundo"
  },
  {
    icon: <Share2 className="w-8 h-8 text-[#612c7d]" />,
    titulo: "Comparte conocimiento",
    descripcion: "Publica tus investigaciones y contribuye al conocimiento para todo el mundo"
  },
  {
    icon: <Star className="w-8 h-8 text-[#612c7d]" />,
    titulo: "Guarda favoritos",
    descripcion: "Marca publicaciones para leerlas más tarde y demuestra tu apoyo al autor"
  },
  {
    icon: <BookMarked className="w-8 h-8 text-[#612c7d]" />,
    titulo: "Organiza tu bitácora",
    descripcion: "Gestiona tus publicaciones de manera eficiente, y recupera extractos para tus trabajos y estudio"
  },
  {
    icon: <Award className="w-8 h-8 text-[#612c7d]" />,
    titulo: "Reconocimiento",
    descripcion: "Obtén visibilidad en esta comunidad de divulgación de artículos científicos y académicos"
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5
    }
  }
};

export default function RegistroContainer() {
  return (
    <div className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#612c7d] mb-4">
            ¿Por qué unirte a Axotl Xires?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Descubre todas las ventajas de ser parte de nuestra comunidad académica
          </p>
        </div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {caracteristicas.map((caracteristica, index) => (
            <motion.div
              key={index}
              className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
              variants={itemVariants}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-purple-50 rounded-lg">
                  {caracteristica.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {caracteristica.titulo}
                </h3>
              </div>
              <p className="text-gray-600">
                {caracteristica.descripcion}
              </p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-2xl font-semibold text-[#612c7d] mb-6">
            ¡Únete hoy y comienza a compartir conocimiento!
          </p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="bg-[#612c7d] text-white px-8 py-3 rounded-full hover:bg-[#7d3ba3] transition-colors"
          >
            Crear cuenta ahora
          </button>
        </motion.div>
      </div>
    </div>
  );
} 