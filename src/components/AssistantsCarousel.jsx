import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { CAROUSEL_DATA } from '../constants/data';

const AssistantsCarousel = () => {
    const scrollContainerRef = useRef(null);
    const [selectedId, setSelectedId] = useState(null);
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

    const minSwipeDistance = 50;

    const onTouchStart = (e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = (isLightbox = false) => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe || isRightSwipe) {
            if (isLightbox) {
                if (isLeftSwipe) nextImage({ stopPropagation: () => {} });
                if (isRightSwipe) prevImage({ stopPropagation: () => {} });
            } else {
                scroll(isLeftSwipe ? 'right' : 'left');
            }
        }
    };

    const scroll = (direction) => {
        const container = scrollContainerRef.current;
        if (container) {
            const scrollAmount = container.offsetWidth; 
            container.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    const nextImage = (e) => {
        if (e && e.stopPropagation) e.stopPropagation();
        const currentIndex = CAROUSEL_DATA.images.findIndex(img => img.id === selectedId);
        const nextIndex = (currentIndex + 1) % CAROUSEL_DATA.images.length;
        setSelectedId(CAROUSEL_DATA.images[nextIndex].id);
    };

    const prevImage = (e) => {
        if (e && e.stopPropagation) e.stopPropagation();
        const currentIndex = CAROUSEL_DATA.images.findIndex(img => img.id === selectedId);
        const prevIndex = (currentIndex - 1 + CAROUSEL_DATA.images.length) % CAROUSEL_DATA.images.length;
        setSelectedId(CAROUSEL_DATA.images[prevIndex].id);
    };

    const selectedImage = CAROUSEL_DATA.images.find(img => img.id === selectedId);

    return (
        <section className="py-16 bg-primary relative overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="bg-white rounded-4xl p-8 md:p-12 shadow-premium relative">
                    <h3 className="text-2xl md:text-5xl font-black text-secondary mb-10 text-center uppercase tracking-tight font-display">
                        {CAROUSEL_DATA.title}
                    </h3>
                    
                    <div className="relative group/main">
                        <button 
                            onClick={() => scroll('left')}
                            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm p-3 md:p-4 rounded-full shadow-xl text-secondary hover:bg-secondary hover:text-white transition-all opacity-100 md:opacity-0 group-hover/main:opacity-100"
                            aria-label="Anterior"
                        >
                            <ChevronLeft size={24} className="md:w-7 md:h-7" />
                        </button>

                        <div 
                            ref={scrollContainerRef}
                            className="flex overflow-x-auto gap-4 md:gap-8 pb-10 snap-x snap-mandatory scrollbar-hide"
                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                            onTouchStart={onTouchStart}
                            onTouchMove={onTouchMove}
                            onTouchEnd={() => onTouchEnd(false)}
                        >
                            {CAROUSEL_DATA.images.map((img) => (
                                <div key={img.id} className="min-w-full md:min-w-[500px] snap-center px-2 md:px-0">
                                    <div 
                                        className="rounded-3xl overflow-hidden shadow-xl hover:shadow-premium transition-all h-[400px] md:h-[500px] bg-gray-200 relative group/card cursor-pointer"
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
                            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm p-3 md:p-4 rounded-full shadow-xl text-secondary hover:bg-secondary hover:text-white transition-all opacity-100 md:opacity-0 group-hover/main:opacity-100"
                            aria-label="Siguiente"
                        >
                            <ChevronRight size={24} className="md:w-7 md:h-7" />
                        </button>
                    </div>
                    
                    <p className="text-center text-gray-500 italic mt-4 text-sm">
                        Hacé clic en las fotos para verlas en pantalla completa
                    </p>
                </div>
            </div>

            {selectedImage && createPortal(
                <div 
                    className="fixed inset-0 z-9999 bg-black/95 flex items-center justify-center p-0"
                    onClick={() => setSelectedId(null)}
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={() => onTouchEnd(true)}
                >
                    <button 
                        className="fixed top-6 right-6 text-white/70 hover:text-white transition-colors p-2 z-10000 bg-black/20 rounded-full"
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedId(null);
                        }}
                    >
                        <X size={40} className="md:w-12 md:h-12" strokeWidth={1.5} />
                    </button>

                    <button 
                        className="absolute left-2 md:left-8 text-white/40 hover:text-white transition-all p-3 md:p-4 z-10000 transform active:scale-90"
                        onClick={prevImage}
                    >
                        <ChevronLeft size={48} className="md:w-16 md:h-16" strokeWidth={1} />
                    </button>
                    
                    <img 
                        src={selectedImage.src} 
                        alt={selectedImage.alt} 
                        className="w-full h-full max-w-[95vw] max-h-[85vh] md:max-w-[75vw] md:max-h-[85vh] object-contain shadow-2xl rounded-sm pointer-events-auto"
                        onClick={(e) => e.stopPropagation()}
                    />

                    <button 
                        className="absolute right-2 md:right-8 text-white/40 hover:text-white transition-all p-3 md:p-4 z-10000 transform active:scale-90"
                        onClick={nextImage}
                    >
                        <ChevronRight size={48} className="md:w-16 md:h-16" strokeWidth={1} />
                    </button>
                </div>,
                document.body
            )}
        </section>
    );
};

export default AssistantsCarousel;


