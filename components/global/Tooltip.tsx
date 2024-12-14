import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface TooltipProps {
  message: string;
  children: React.ReactNode;
}

const Tooltip = ({ message, children }: TooltipProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative flex items-center"
    >
      {children}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="absolute top-[-1.5rem] left-1/2 transform -translate-x-1/2 max-w-xs w-auto px-2 py-1 bg-gray-700 text-white text-sm rounded-md shadow-lg whitespace-normal"
            style={{ whiteSpace: 'normal' }}
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Tooltip;
