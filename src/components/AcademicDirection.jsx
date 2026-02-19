import React from 'react';

const AcademicDirection = () => {
    return (
        <section id="direccion" className="py-20 bg-primary relative overflow-hidden">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl md:text-5xl font-black text-secondary mb-16 text-center uppercase tracking-tight font-display">
                    Dirección y Coordinación Académica
                </h2>

                <div className="max-w-6xl mx-auto bg-white rounded-4xl shadow-premium overflow-hidden flex flex-col md:flex-row">
                    <div className="md:w-1/3 relative min-h-[400px]">
                        <img 
                            src="https://images.unsplash.com/photo-1537368910025-700350fe46c7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                            alt="Dirección Académica" 
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent md:bg-linear-to-r"></div>
                    </div>
                    
                    <div className="md:w-2/3 p-10 md:p-16 flex flex-col justify-center">
                        
                        <div className="space-y-6 text-lg text-gray-600 leading-relaxed font-medium">
                            <p>
                                La formación está dirigida por el Médico Veterinario Lucas Palacio, con experiencia en clínica de pequeños animales y exóticos, especialista en fauna silvestre y Magíster en Gestión de Fauna Silvestre y Bienestar Animal.
                            </p>
                            <p>
                                Su trayectoria profesional en el ámbito clínico y de conservación respalda el enfoque académico y la calidad de la formación.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AcademicDirection;
