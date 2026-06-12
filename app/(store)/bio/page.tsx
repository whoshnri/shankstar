import Image from 'next/image';

export const metadata = {
  title: 'Bio | SUPERVILLAIN',
  description: 'The story behind the prints.',
};

export default async function BioPage() {
  return (
    <div className="p-8 md:p-12 lg:p-20 max-w-4xl">
      <div className="mb-12 relative aspect-square w-32 md:w-48 overflow-hidden grayscale">
        <Image 
          src="/bio-pic.png" 
          alt="Franklyn" 
          fill 
          className="object-cover"
        />
      </div>

      <h1 className="text-4xl md:text-5xl font-serif font-light mb-12 tracking-tight">Franklyn</h1>
      
      <div className="space-y-8 text-lg text-muted-foreground leading-relaxed font-light">
        <p>
          Franklyn is a designer and artist who creates vinyl prints and art prints as a personal pursuit. Under the moniker SUPERVILLAIN, he explores the intersection of bold graphic design and physical media.
        </p>
        
        <p>
          What started as a hobby has evolved into a meticulous exploration of color, form, and texture. Each print is a reflection of his interest in modern aesthetics, often drawing inspiration from vintage vinyl culture and contemporary minimalist design.
        </p>
        
        <p>
          Working primarily with vinyl and high-quality art papers, Franklyn focuses on the tactile nature of the print medium, ensuring each piece carries a distinct physical presence.
        </p>
      </div>
    </div>
  );
}
