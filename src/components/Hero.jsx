import { ChevronDown } from 'lucide-react';
import { HERO_DATA } from '../constants/data';

const Hero = () => {
    return (
        <section id="inicio" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 md:pt-28 pb-12">
            <div className="absolute inset-0 z-0">
                <img 
                    src={HERO_DATA.image} 
                    alt="Veterinary Assistant" 
                    className="w-full h-full object-cover scale-105 animate-slow-zoom"
                />
                <div className="absolute inset-0 bg-linear-to-b from-secondary/60 to-black/80"></div>
            </div>

            <div className="container mx-auto px-4 z-10 text-center text-white">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl md:text-6xl font-black mb-4 leading-tight tracking-tighter drop-shadow-2xl whitespace-pre-line">
                        {HERO_DATA.title}
                    </h1>
                    <p className="text-xl md:text-2xl mb-6 max-w-2xl mx-auto text-white font-bold leading-relaxed drop-shadow-md">
                        {HERO_DATA.subtitle}
                    </p>
                    <div className="flex flex-col items-start gap-2 max-w-md mx-auto mb-8 text-left">
                        {HERO_DATA.features.map((item, index) => (
                            <div key={index} className="flex items-center gap-3">
                                <div className="bg-primary/20 p-1 rounded-full">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <span className="text-lg text-gray-100 font-medium drop-shadow-md">{item}</span>
                            </div>
                        ))}
                    </div>
                    <div className="flex flex-col items-center gap-6">
                        <button 
                            onClick={() => document.getElementById('contacto').scrollIntoView({ behavior: 'smooth' })}
                            className="group relative bg-primary hover:bg-primary-hover text-white font-black py-5 px-12 rounded-full transition-all transform hover:scale-105 shadow-[0_20px_40px_-10px_rgba(102,202,247,0.5)] mt-4 text-xl overflow-hidden flex items-center gap-2"
                            aria-label="Ir a la sección de contacto para inscribirse"
                        >
                            <span className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                            {HERO_DATA.ctaText}
                            <ChevronDown className="animate-bounce" size={24} />
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
