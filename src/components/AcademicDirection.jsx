import React from 'react';
import { ACADEMIC_DIRECTION_DATA } from '../constants/data';

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
            </div>
        </section>
    );
};

export default AcademicDirection;
