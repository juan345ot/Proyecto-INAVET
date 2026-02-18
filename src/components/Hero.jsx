import React from 'react';

const Hero = () => {
    return (
        <section id="inicio" className="relative h-screen flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 z-0">
                <img 
                    src="https://images.unsplash.com/photo-1599443015574-be5fe8a05783?ixlib=rb-1.2.1&auto=format&fit=crop&w=1400&q=80&fm=webp" 
                    alt="Veterinary Assistant" 
                    className="w-full h-full object-cover scale-105 animate-slow-zoom"
                />
                <div className="absolute inset-0 bg-linear-to-b from-secondary/60 to-black/80"></div>
            </div>

            <div className="container mx-auto px-4 z-10 text-center text-white">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl md:text-7xl font-black mb-8 leading-tight tracking-tighter drop-shadow-2xl">
                        Formación Online de <br/>
                        <span className="text-primary">Auxiliar Veterinario</span>
                    </h1>
                    <p className="text-xl md:text-2xl mb-4 max-w-2xl mx-auto text-white font-bold leading-relaxed drop-shadow-md">
                        Capacitación integral con certificación y orientación laboral
                    </p>
                    <p className="text-base md:text-lg mb-12 max-w-2xl mx-auto text-gray-300 font-medium leading-relaxed drop-shadow-md">
                        Estudiá desde cualquier lugar, comenzá en cualquier mes del año, con clases en vivo grabadas
                    </p>
                    <div className="flex flex-col items-center gap-6">
                        <button 
                            onClick={() => document.getElementById('contacto').scrollIntoView({ behavior: 'smooth' })}
                            className="group relative bg-primary hover:bg-primary-hover text-white font-black py-5 px-12 rounded-full transition-all transform hover:scale-105 shadow-[0_20px_40px_-10px_rgba(102,202,247,0.5)] mt-4 text-xl overflow-hidden"
                            aria-label="Ir a la sección de contacto para inscribirse"
                        >
                            <span className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                            Inscribirme / Pedir información
                        </button>
                    </div>
                </div>
            </div>
            
            <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce opacity-50">
                <div className="w-1 h-12 bg-linear-to-b from-primary to-transparent rounded-full"></div>
            </div>
        </section>
    );
};

export default Hero;
