import { cn } from "@/lib/utils";

interface PropiedadesFondoAjolote {
  children: React.ReactNode;
  className?: string;
}

export default function FondoAjolote({ children, className }: PropiedadesFondoAjolote) {
  return (
    <div 
      className={cn(
        "min-h-screen bg-[#612c7d] py-16 flex items-center justify-center",
        className
      )}
      style={{
        backgroundImage: `url(${process.env.NEXT_PUBLIC_ASSET_URL}/MitadAjoloteBlanco.png)`,
        backgroundPosition: 'left center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: '40% auto',
        backgroundAttachment: 'fixed',
        backgroundOrigin: 'border-box',
        backgroundClip: 'border-box'
      }}
    >
      {children}
    </div>
  );
} 