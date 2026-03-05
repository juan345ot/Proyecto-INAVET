import React, { useState } from 'react';
import { Video, Calendar, Globe, Award, BookOpen, ChevronDown } from 'lucide-react';
import { MODALITY_DATA, MODULES_DATA } from '../constants/data';

const iconMap = {
    Video: Video,
    Calendar: Calendar,
    Globe: Globe
};

const Modality = () => {
    const [openModule, setOpenModule] = useState(null);

    const toggleModule = (idx) => {
        setOpenModule(openModule === idx ? null : idx);
    };

    return (
        <section id="modalidad" className="py-16 bg-primary">
            <div className="container mx-auto px-4">
                
                <h2 className="text-3xl md:text-5xl font-black text-white mb-10 text-center uppercase tracking-tight font-display">
                    Modalidad de Cursada
                </h2>

                <div className="grid md:grid-cols-3 gap-8 mb-12">
                    {MODALITY_DATA.features.map((feature, idx) => {
                        const Icon = iconMap[feature.icon];
                        return (
                            <div key={idx} className="bg-white p-8 rounded-3xl shadow-soft-depth hover:shadow-premium transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 group">
                                <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-secondary transition-colors">
                                    {Icon && <Icon className="w-8 h-8 text-secondary group-hover:text-white" />}
                                </div>
                                <h3 className="text-2xl font-black text-gray-800 mb-3 uppercase tracking-wide font-display">{feature.title}</h3>
                                <p className="text-gray-600 leading-relaxed font-medium">{feature.description}</p>
                            </div>
                        );
                    })}
                </div>

                <div className="bg-white p-10 rounded-4xl shadow-premium border border-gray-50 mb-12 max-w-4xl mx-auto overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full -mr-16 -mt-16"></div>
                    <h3 className="text-2xl font-extrabold text-secondary mb-8 flex items-center gap-4 font-display">
                        <div className="bg-secondary/10 p-2 rounded-xl">
                            <BookOpen size={28} />
                        </div>
                        Programa de Formación
                    </h3>
                    <p className="text-lg text-gray-700 mb-8 font-medium italic">Hacé clic en cada módulo para ver su contenido detallado:</p>
                    
                    <div className="space-y-4">
                        {MODULES_DATA.map((module, idx) => (
                            <div 
                                key={idx} 
                                className={`border rounded-2xl transition-all duration-300 ${openModule === idx ? 'border-secondary shadow-md bg-secondary/5' : 'border-gray-100 bg-gray-50'}`}
                            >
                                <button 
                                    onClick={() => toggleModule(idx)}
                                    className="w-full p-5 flex items-center justify-between text-left group"
                                >
                                    <div className="flex items-center">
                                        <span className={`font-display text-lg font-bold transition-colors ${openModule === idx ? 'text-secondary' : 'text-gray-800'}`}>
                                            {module.title}
                                        </span>
                                    </div>
                                    <ChevronDown className={`text-secondary transition-transform duration-300 ${openModule === idx ? 'rotate-180' : ''}`} />
                                </button>
                                
                                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openModule === idx ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                                    <div className="p-4 md:p-8 pt-0 md:pt-0">
                                        <p className="text-gray-600 leading-relaxed font-medium border-l-4 border-primary/30 pl-4 md:pl-6 py-2 bg-primary/5 rounded-r-xl text-sm md:text-base">
                                            {module.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    <div className="bg-secondary text-white p-10 rounded-4xl shadow-premium relative overflow-hidden group">
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-1/2 translate-y-1/2 group-hover:scale-150 transition-transform duration-700"></div>
                        <h2 className="text-3xl font-black mb-10 uppercase tracking-widest text-primary font-display text-center">DURACIÓN</h2>
                        <div className="space-y-6 relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="bg-white/10 p-3 rounded-2xl">
                                    <Calendar className="text-primary" size={32} />
                                </div>
                                <p className="text-xl"><strong>Duración total:</strong> {MODALITY_DATA.duration}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="bg-white/10 p-3 rounded-2xl">
                                    <Globe className="text-primary" size={32} />
                                </div>
                                <p className="text-xl"><strong>Acceso al material:</strong> {MODALITY_DATA.access}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-secondary text-white p-10 rounded-4xl shadow-premium relative overflow-hidden group">
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-1/2 translate-y-1/2 group-hover:scale-150 transition-transform duration-700"></div>
                        <h2 className="text-3xl font-black mb-10 uppercase tracking-widest text-primary font-display text-center">CERTIFICACIÓN</h2>
                        <div className="space-y-6 relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="bg-white/10 p-3 rounded-2xl shrink-0">
                                    <Award className="text-primary" size={32} />
                                </div>
                                <div>
                                    <h4 className="text-xl font-black text-primary leading-tight font-display">Certificado INAVET</h4>
                                    <p className="text-white/70 font-medium">Incluido, sin costo adicional.</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="bg-white/10 p-3 rounded-2xl shrink-0">
                                    <Award className="text-primary" size={32} />
                                </div>
                                <div>
                                    <h4 className="text-xl font-black text-primary leading-tight font-display">Certificación de la Cámara Argentina para la Formación Profesional y la Capacitación Laboral</h4>
                                    <p className="text-white/70 font-medium">Opcional, con costo adicional.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default Modality;
