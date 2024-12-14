import Link from 'next/link'
import { Metadata } from 'next'
import FondoAjolote from '@/components/global/genericos/FondoAjolote';

export const metadata: Metadata = {
  title: '404 - Axotl Xires'
}

export default function NotFound() {
  return (
    <FondoAjolote className="text-white">
      <div className="text-center">
        <h2 className="text-4xl font-bold mb-4">Nos hemos perdido</h2>
        <p className="text-gray-200 mb-4">No hemos podido localizar el elemento solicitado</p>
        <Link 
          href="/" 
          className="bg-white text-[#612c7d] hover:bg-gray-100 font-bold py-2 px-4 rounded transition-colors"
        >
          Volver al inicio
        </Link>
      </div>
    </FondoAjolote>
  )
}