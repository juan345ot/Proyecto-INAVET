import React from 'react';

const InavetInfo = () => {
    return (
        <section id="inavet" className="py-16 bg-primary relative overflow-hidden">
            {/* Decorative background circle */}
            <div className="absolute top-24 -right-24 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"></div>
            
            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center">
                    <h2 className="text-3xl md:text-5xl font-black text-white mb-10 uppercase tracking-tighter">¿QUÉ ES INAVET?</h2>
                    <div className="max-w-4xl mx-auto text-white text-xl md:text-2xl leading-relaxed space-y-8 font-medium">
                        <p className="border-l-4 border-secondary pl-8 text-left">
                            INAVET es un instituto de formación especializado en la capacitación de Auxiliares Veterinarios, con modalidad 100% online y orientación práctica.
                        </p>
                        <p className="bg-secondary/20 backdrop-blur-sm p-8 rounded-4xl border border-secondary/30 text-white">
                            Brindamos una formación estructurada por áreas clave del ámbito veterinario, destinada a quienes buscan desarrollar conocimientos sólidos y aplicables en el ejercicio del rol auxiliar.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default InavetInfo;
