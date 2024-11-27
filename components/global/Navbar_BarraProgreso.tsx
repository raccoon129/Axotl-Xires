import { motion } from "framer-motion";

interface BarraProgresoProps {
  isLoading: boolean;
}

const BarraProgreso = ({ isLoading }: BarraProgresoProps) => {
  return (
    <motion.div
      initial={{ scaleX: 0 }}
      animate={isLoading ? { scaleX: 1 } : { scaleX: 0 }}
      transition={isLoading ? { duration: 0.8, ease: "easeInOut" } : { duration: 0.2 }}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "4px",
        background: "linear-gradient(to right, #9333ea, #c026d3)",
        transformOrigin: "left",
        zIndex: 50,
      }}
    />
  );
};

export default BarraProgreso; 