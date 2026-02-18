import { CreditCard, Banknote, Check } from 'lucide-react';
import { COURSE_INFO } from '../constants/data';

const Pricing = () => {
    return (
        <section id="inversion" className="py-16 bg-primary relative">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="grid md:grid-cols-2 gap-12 items-stretch">
                    {/* INVERSIÓN */}
                    <div className="flex flex-col">
                        <h2 className="text-3xl md:text-5xl font-black text-white mb-8 text-center md:text-left uppercase tracking-tight font-display">INVERSIÓN</h2>
                        <div className="bg-white rounded-4xl p-10 shadow-premium border border-gray-100 grow relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                            
                            <div className="relative z-10">
                                <p className="text-primary font-black uppercase tracking-[0.2em] text-sm mb-4">Valor Cuota Mensual</p>
                                <div className="flex items-baseline gap-2 mb-8">
                                    <span className="text-5xl md:text-7xl font-black text-secondary tracking-tighter font-display">{COURSE_INFO.price}</span>
                                    <span className="text-xl text-gray-400 font-bold italic">ARS / mes</span>
                                </div>
                                
                                <div className="space-y-6">
                                    <div className="flex items-center p-4 bg-green-50 rounded-2xl border border-green-100">
                                        <div className="bg-green-500 text-white p-1 rounded-full mr-4">
                                            <Check size={18} />
                                        </div>
                                        <p className="font-black text-green-700">MATRÍCULA BONIFICADA POR APERTURA (mes de marzo)</p>
                                    </div>

                                    <ul className="space-y-4 pt-4">
                                        <li className="flex items-center group/item cursor-default">
                                            <div className="w-2 h-2 bg-primary rounded-full mr-4 group-hover/item:scale-150 transition-transform"></div>
                                            <span className="text-gray-600 font-bold text-lg">Posibilidad de pago mensual</span>
                                        </li>
                                        <li className="flex items-center group/item cursor-default">
                                            <div className="w-2 h-2 bg-primary rounded-full mr-4 group-hover/item:scale-150 transition-transform"></div>
                                            <span className="text-secondary font-bold text-lg leading-tight uppercase tracking-wide font-display">Descuento especial por pago completo (10%)</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* MEDIOS DE PAGO */}
                    <div className="flex flex-col">
                        <h2 className="text-3xl md:text-5xl font-black text-white mb-8 text-center md:text-left uppercase tracking-tight font-display">MEDIOS DE PAGO</h2>
                        <div className="space-y-6 grow">
                            <div className="bg-gray-50 p-8 rounded-4xl border border-gray-100 flex items-start group hover:bg-white hover:shadow-premium transition-all duration-300 transform hover:-translate-x-2">
                                <div className="bg-white p-4 shadow-soft-depth rounded-2xl mr-6 group-hover:bg-primary transition-colors">
                                    <CreditCard className="text-primary group-hover:text-white" size={32} />
                                </div>
                                <div className="grow">
                                    <h3 className="text-2xl font-black text-secondary mb-3 uppercase tracking-wide font-display">Mercado Pago</h3>
                                    <p className="text-gray-500 font-medium mb-4 italic">Tarjetas de crédito, débito, cuotas y transferencia.</p>
                                    <div className="flex gap-2">
                                        <div className="w-8 h-5 bg-gray-200 rounded-sm"></div>
                                        <div className="w-8 h-5 bg-gray-200 rounded-sm"></div>
                                        <div className="w-8 h-5 bg-gray-200 rounded-sm"></div>
                                    </div>
                                </div>
                            </div>
 
                            <div className="bg-gray-50 p-8 rounded-4xl border border-gray-100 flex items-center group hover:bg-white hover:shadow-premium transition-all duration-300 transform hover:-translate-x-2">
                                <div className="bg-white p-4 shadow-soft-depth rounded-2xl mr-6 group-hover:bg-secondary transition-colors">
                                    <Banknote className="text-secondary group-hover:text-white" size={32} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-secondary uppercase tracking-wide font-display">Transferencia Bancaria</h3>
                                    <p className="text-gray-500 font-medium italic">Directo y seguro.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default Pricing;
