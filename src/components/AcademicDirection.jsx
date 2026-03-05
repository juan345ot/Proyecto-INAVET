import React from 'react';
import { ACADEMIC_DIRECTION_DATA, DIRECTION_GALLERY_DATA } from '../constants/data';

const AcademicDirection = () => {
    return (
        <section id="direccion" className="py-20 bg-primary relative overflow-hidden">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl md:text-5xl font-black text-secondary mb-16 text-center uppercase tracking-tight font-display">
                    {ACADEMIC_DIRECTION_DATA.title}
                </h2>

                <div className="max-w-6xl mx-auto bg-white rounded-4xl shadow-premium overflow-hidden flex flex-col md:flex-row">
                    <div className="md:w-1/3 relative min-h-[400px]">
                        <img 
                            src={ACADEMIC_DIRECTION_DATA.image} 
                            alt="Dirección Académica" 
                            className="absolute inset-0 w-full h-full object-cover"
                            style={{ objectPosition: '50% 20%' }}
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent md:bg-linear-to-r"></div>
                    </div>
                    
                    <div className="md:w-2/3 p-10 md:p-16 flex flex-col justify-center">
                        <div className="space-y-6 text-lg text-gray-600 leading-relaxed font-medium">
                            {ACADEMIC_DIRECTION_DATA.paragraphs.map((p, index) => (
                                <p key={index}>{p}</p>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Dirección en Acción */}
                <h3 className="text-2xl md:text-3xl font-black text-secondary mt-16 mb-8 text-center uppercase tracking-tight font-display">
                    {DIRECTION_GALLERY_DATA.title}
                </h3>
                <div className="flex justify-center gap-3 md:gap-4 flex-wrap max-w-5xl mx-auto">
                    {DIRECTION_GALLERY_DATA.images.map((img) => (
                        <div key={img.id} className="w-44 h-44 md:w-56 md:h-56 rounded-2xl overflow-hidden shadow-lg">
                            <img 
                                src={img.src} 
                                alt={img.alt} 
                                className="w-full h-full object-cover"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default AcademicDirection;
