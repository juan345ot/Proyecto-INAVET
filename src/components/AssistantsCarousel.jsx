import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

import auxiliar1 from '../assets/auxiliares/auxiliar1.jpg';
import auxiliar2 from '../assets/auxiliares/auxiliar2.jpg';
import auxiliar3 from '../assets/auxiliares/auxiliar3.jpg';
import auxiliar4 from '../assets/auxiliares/auxiliar4.jpg';

const IMAGES_DATA = [
    { id: 1, src: auxiliar1, alt: "Auxiliar veterinario trabajando 1" },
    { id: 2, src: auxiliar2, alt: "Auxiliar veterinario trabajando 2" },
    { id: 3, src: auxiliar3, alt: "Auxiliar veterinario trabajando 3" },
    { id: 4, src: auxiliar4, alt: "Auxiliar veterinario trabajando 4" },
];

const AssistantsCarousel = () => {
    const scrollContainerRef = useRef(null);
    const [selectedId, setSelectedId] = useState(null);

    const scroll = (direction) => {
        const container = scrollContainerRef.current;
        if (container) {
            const scrollAmount = 400; 
            container.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    const nextImage = (e) => {
        e.stopPropagation();
        const currentIndex = IMAGES_DATA.findIndex(img => img.id === selectedId);
        const nextIndex = (currentIndex + 1) % IMAGES_DATA.length;
        setSelectedId(IMAGES_DATA[nextIndex].id);
    };

    const prevImage = (e) => {
        e.stopPropagation();
        const currentIndex = IMAGES_DATA.findIndex(img => img.id === selectedId);
        const prevIndex = (currentIndex - 1 + IMAGES_DATA.length) % IMAGES_DATA.length;
        setSelectedId(IMAGES_DATA[prevIndex].id);
    };

    const selectedImage = IMAGES_DATA.find(img => img.id === selectedId);

    return (
        <section className="py-16 bg-gray-50 relative">
            <div className="container mx-auto px-4">
                <h3 className="text-2xl md:text-5xl font-black text-secondary mb-10 text-center uppercase tracking-tight font-display">
                    Nuestros Alumnos en Acción
                </h3>
                
                <div className="relative group/main">
                    <button 
                        onClick={() => scroll('left')}
                        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-xl text-secondary hover:bg-secondary hover:text-white transition-all opacity-0 group-hover/main:opacity-100 hidden md:block"
                        aria-label="Anterior"
                    >
                        <ChevronLeft size={28} />
                    </button>

                    <div 
                        ref={scrollContainerRef}
                        className="flex overflow-x-auto gap-8 pb-10 snap-x snap-mandatory scrollbar-hide"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {IMAGES_DATA.map((img) => (
                            <div key={img.id} className="min-w-[80vw] md:min-w-[500px] snap-center">
                                <div 
                                    className="rounded-3xl overflow-hidden shadow-xl hover:shadow-premium transition-all h-[350px] md:h-[500px] bg-gray-200 relative group/card cursor-pointer"
                                    onClick={() => setSelectedId(img.id)}
                                >
                                    <img 
                                        src={img.src} 
                                        alt={img.alt} 
                                        className="w-full h-full object-cover transition-transform duration-1000 group-hover/card:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-black/5 group-hover/card:bg-black/0 transition-colors flex items-center justify-center">
                                        <div className="bg-white/20 backdrop-blur-md p-4 rounded-full opacity-0 group-hover/card:opacity-100 transition-opacity scale-75 group-hover/card:scale-100 duration-300">
                                            <ChevronRight className="text-white -rotate-45" size={32} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button 
                        onClick={() => scroll('right')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-xl text-secondary hover:bg-secondary hover:text-white transition-all opacity-0 group-hover/main:opacity-100 hidden md:block"
                        aria-label="Siguiente"
                    >
                        <ChevronRight size={28} />
                    </button>
                </div>
                
                <p className="text-center text-gray-500 italic mt-4 text-sm">
                    Hacé clic en las fotos para verlas en pantalla completa
                </p>
            </div>

            {selectedImage && createPortal(
                <div 
                    className="fixed inset-0 z-9999 bg-black/95 flex items-center justify-center p-0"
                    onClick={() => setSelectedId(null)}
                >
                    <button 
                        className="fixed top-6 right-6 text-white/70 hover:text-white transition-colors p-2 z-10000"
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedId(null);
                        }}
                    >
                        <X size={48} strokeWidth={1.5} />
                    </button>

                    <button 
                        className="absolute left-2 md:left-8 text-white/40 hover:text-white transition-all p-4 z-10000 transform active:scale-90"
                        onClick={prevImage}
                    >
                        <ChevronLeft size={64} strokeWidth={1} />
                    </button>
                    
                    <img 
                        src={selectedImage.src} 
                        alt={selectedImage.alt} 
                        className="w-full h-full max-w-[90vw] max-h-[80vh] md:max-w-[75vw] md:max-h-[85vh] object-contain shadow-2xl rounded-sm pointer-events-auto"
                        onClick={(e) => e.stopPropagation()}
                    />

                    <button 
                        className="absolute right-2 md:right-8 text-white/40 hover:text-white transition-all p-4 z-10000 transform active:scale-90"
                        onClick={nextImage}
                    >
                        <ChevronRight size={64} strokeWidth={1} />
                    </button>
                </div>,
                document.body
            )}
        </section>
    );
};

export default AssistantsCarousel;


