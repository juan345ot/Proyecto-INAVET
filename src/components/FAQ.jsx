import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { FAQ_DATA } from '../constants/data';

const FAQItem = ({ question, answer, id }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-soft-depth hover:shadow-premium transition-all duration-300 mb-4">
            <button 
                className="w-full px-8 py-6 text-left flex justify-between items-center hover:bg-gray-50/50 transition-colors focus:outline-none group"
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${id}`}
            >
                <span className={`text-lg font-black transition-colors ${isOpen ? 'text-secondary font-display' : 'text-gray-800 font-display'}`}>
                    {question}
                </span>
                <div className={`p-2 rounded-full transition-all ${isOpen ? 'bg-secondary text-white rotate-180' : 'bg-primary/10 text-primary'}`}>
                    <ChevronDown size={20} />
                </div>
            </button>
            <div 
                id={`faq-answer-${id}`}
                role="region"
                aria-labelledby={`faq-question-${id}`}
                className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
            >
                <div className="px-8 pb-8 pt-2 text-gray-600 text-lg font-medium leading-relaxed border-t border-gray-50 mt-2">
                    {answer}
                </div>
            </div>
        </div>
    );
};

const FAQ = () => {
    const faqs = FAQ_DATA;

    return (
        <section id="faq" className="py-16 bg-primary relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -ml-32 -mb-32"></div>
            
            <div className="container mx-auto px-4 max-w-4xl relative z-10">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-5xl font-black text-white mb-6 uppercase tracking-tight">Preguntas Frecuentes</h2>
                    <p className="text-xl text-white/80 font-medium">Despejá tus dudas y comenzá hoy mismo.</p>
                </div>
                
                <div className="space-y-2">
                    {faqs.map((faq, index) => (
                        <FAQItem key={index} id={index} question={faq.question} answer={faq.answer} />
                    ))}
                </div>
                
                <div className="mt-12 text-center">
                    <div className="inline-flex items-center gap-2 bg-white px-6 py-3 rounded-full border border-gray-100 shadow-sm">
                        <HelpCircle className="text-primary" size={20} />
                        <span className="text-gray-600 font-bold">¿Tenés otra consulta?</span>
                        <button 
                            onClick={() => document.getElementById('contacto').scrollIntoView({ behavior: 'smooth' })}
                            className="text-secondary font-black hover:underline ml-1"
                        >
                            Chateá con nosotros
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FAQ;
