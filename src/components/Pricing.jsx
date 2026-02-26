import { CreditCard, Banknote, Check } from 'lucide-react';
import { COURSE_INFO, PRICING_DATA } from '../constants/data';

const Pricing = () => {
    return (
        <section id="inversion" className="py-16 bg-primary relative">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="grid md:grid-cols-2 gap-12 items-stretch">
                    {/* INVERSIÓN */}
                    <div className="flex flex-col">
                        <h2 className="text-3xl md:text-5xl font-black text-white mb-8 text-center md:text-left uppercase tracking-tight font-display">
                            {PRICING_DATA.title}
                        </h2>
                        <div className="bg-white rounded-4xl p-10 shadow-premium border border-gray-100 grow relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                            
                            <div className="relative z-10">
                                <p className="text-primary font-black uppercase tracking-[0.2em] text-sm mb-4">
                                    {PRICING_DATA.cuotaLabel}
                                </p>
                                <div className="flex items-baseline gap-2 mb-8">
                                    <span className="text-5xl md:text-7xl font-black text-secondary tracking-tighter font-display">{COURSE_INFO.price}</span>
                                    <span className="text-xl text-gray-400 font-bold italic">{PRICING_DATA.cuotaCurrency}</span>
                                </div>
                                
                                <div className="space-y-6">
                                    <div className="flex items-center p-4 bg-green-50 rounded-2xl border border-green-100">
                                        <div className="bg-green-500 text-white p-1 rounded-full mr-4">
                                            <Check size={18} />
                                        </div>
                                        <p className="font-black text-green-700">{PRICING_DATA.bonusTag}</p>
                                    </div>

                                    <ul className="space-y-4 pt-4">
                                        {PRICING_DATA.features.map((feature, index) => (
                                            <li key={index} className="flex items-center group/item cursor-default">
                                                <div className="w-2 h-2 bg-primary rounded-full mr-4 group-hover/item:scale-150 transition-transform"></div>
                                                <span className="text-gray-600 font-bold text-lg">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* MEDIOS DE PAGO */}
                    <div className="flex flex-col">
                        <h2 className="text-3xl md:text-5xl font-black text-white mb-8 text-center md:text-left uppercase tracking-tight font-display">
                            {PRICING_DATA.paymentMethodsTitle}
                        </h2>
                        <div className="space-y-6 grow">
                            {PRICING_DATA.methods.map((method, index) => (
                                <div key={index} className="bg-gray-50 p-8 rounded-4xl border border-gray-100 flex items-center group hover:bg-white hover:shadow-premium transition-all duration-300 transform hover:-translate-x-2">
                                    <div className={`bg-white p-4 shadow-soft-depth rounded-2xl mr-6 group-hover:bg-${index === 0 ? 'primary' : 'secondary'} transition-colors`}>
                                        {method.icon === 'CreditCard' ? (
                                            <CreditCard className="text-primary group-hover:text-white" size={32} />
                                        ) : (
                                            <Banknote className="text-secondary group-hover:text-white" size={32} />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-secondary uppercase tracking-wide font-display">{method.name}</h3>
                                        <p className="text-gray-500 font-medium italic">{method.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Pricing;
