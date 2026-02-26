import React from 'react';
import { CheckCircle } from 'lucide-react';
import { OUTCOME_DATA } from '../constants/data';

const Outcome = () => {
    return (
        <section id="objetivos" className="py-16 bg-primary relative overflow-hidden">
            <div className="container mx-auto px-4 z-10 relative">
                <div className="bg-white rounded-4xl p-8 md:p-12 shadow-premium relative overflow-hidden max-w-5xl mx-auto">
                    <h2 className="text-3xl md:text-5xl font-black text-secondary mb-12 text-center uppercase tracking-tight font-display">
                        {OUTCOME_DATA.title}
                    </h2>
                    
                    <div className="grid md:grid-cols-2 gap-x-12 gap-y-6 max-w-4xl mx-auto">
                        {OUTCOME_DATA.items.map((item, index) => (
                            <div key={index} className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
                                <CheckCircle className="text-secondary mt-1 shrink-0" size={24} />
                                <p className="text-lg text-gray-700 font-medium leading-relaxed">{item}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-16 text-center">
                        <p className="text-xl md:text-2xl font-bold text-secondary max-w-3xl mx-auto leading-relaxed bg-secondary/5 p-8 rounded-3xl border border-secondary/10">
                            "{OUTCOME_DATA.summary}"
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Outcome;
