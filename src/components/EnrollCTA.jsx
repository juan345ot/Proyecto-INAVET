import React from 'react';
import { ArrowRight } from 'lucide-react';

const EnrollCTA = () => {
    return (
        <section className="py-16 bg-primary relative overflow-hidden">
            <div className="container mx-auto px-4 text-center">
                <h2 className="text-3xl md:text-4xl font-black text-white mb-8 uppercase tracking-tight font-display">
                    Comenzá tu formación en Auxiliar Veterinario hoy
                </h2>
                <button 
                    onClick={() => document.getElementById('contacto').scrollIntoView({ behavior: 'smooth' })}
                    className="group relative bg-secondary hover:bg-secondary-hover text-white px-10 py-5 rounded-full font-black text-xl shadow-[0_15px_30px_-10px_rgba(112,62,151,0.5)] transition-all transform hover:scale-105 active:scale-95 overflow-hidden"
                    aria-label="Ir a la sección de contacto para inscribirse"
                >
                    <span className="absolute inset-0 bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                    <span className="flex items-center gap-3">
                        Inscribirme / Pedir información
                        <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                    </span>
                </button>
            </div>
        </section>
    );
};

export default EnrollCTA;
