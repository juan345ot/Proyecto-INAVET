import React from 'react';
import { CheckCircle } from 'lucide-react';
import { TARGET_AUDIENCE_DATA } from '../constants/data';

const TargetAudience = () => {
    return (
        <section className="py-16 bg-primary relative overflow-hidden">
            <div className="container mx-auto px-4 relative z-10">
                <div className="bg-secondary p-10 md:p-16 rounded-4xl shadow-premium max-w-5xl mx-auto text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 group-hover:scale-125 transition-transform duration-1000"></div>
                    
                    <h2 className="text-3xl md:text-4xl font-black mb-10 text-center uppercase tracking-tight text-primary">
                        {TARGET_AUDIENCE_DATA.title}
                    </h2>
                    
                    <div className="grid md:grid-cols-2 gap-6 md:gap-10">
                        <div className="space-y-6 md:space-y-8">
                            {TARGET_AUDIENCE_DATA.items.slice(0, 2).map((item, index) => (
                                <div key={index} className="flex items-start bg-white/5 p-5 md:p-6 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors h-full">
                                    <CheckCircle className="text-primary mt-1 mr-4 md:mr-5 shrink-0" size={28} />
                                    <span className="text-lg md:text-xl font-bold leading-tight">{item}</span>
                                </div>
                            ))}
                        </div>
                        <div className="space-y-6 md:space-y-8">
                            {TARGET_AUDIENCE_DATA.items.slice(2, 4).map((item, index) => (
                                <div key={index} className="flex items-start bg-white/5 p-5 md:p-6 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors h-full">
                                    <CheckCircle className="text-primary mt-1 mr-4 md:mr-5 shrink-0" size={28} />
                                    <span className="text-lg md:text-xl font-bold leading-tight">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="mt-12 flex justify-center w-full px-2">
                        <span className="bg-primary text-secondary px-6 md:px-8 py-3 md:py-4 rounded-full font-black text-lg md:text-xl uppercase tracking-tighter md:tracking-widest shadow-xl text-center transform hover:scale-105 transition-transform max-w-full">
                            {TARGET_AUDIENCE_DATA.note}
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TargetAudience;
