import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '404 - Axotl Xires'
}

export default function NotFound() {
  return (
    <div 
      className="flex flex-col items-center justify-center min-h-screen bg-[#612c7d] text-white"
      style={{
        backgroundImage: `url(${process.env.NEXT_PUBLIC_ASSET_URL}/MitadAjoloteBlanco.png)`,
        backgroundPosition: 'left center', // Cambia la posición de la imagen
        backgroundRepeat: 'no-repeat',
        backgroundSize: '40% auto', // Aumenta el tamaño 
        backgroundAttachment: 'fixed',
        backgroundOrigin: 'border-box',
        backgroundClip: 'border-box'
      }}
    >
      <h2 className="text-4xl font-bold mb-4">Nos hemos perdido</h2>
      <p className="text-gray-200 mb-4">No hemos podido localizar el elemento solicitado</p>
      <Link 
        href="/" 
        className="bg-white text-[#612c7d] hover:bg-gray-100 font-bold py-2 px-4 rounded transition-colors"
      >
        Volver al inicio
      </Link>
    </div>
  )
}