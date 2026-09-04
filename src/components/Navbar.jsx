import React, { useState, useEffect } from 'react';
import { Menu, X, ChevronRight } from 'lucide-react';

import logo from '../assets/logo.png';

import useScrollSpy from '../hooks/useScrollSpy';
import { NAV_LINKS } from '../constants/data';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { activeSection, scrollProgress } = useScrollSpy(NAV_LINKS.map(link => link.id));

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (id) => {
        setIsOpen(false);
        const element = document.getElementById(id);
        if (element) {
            const offset = 80;
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = element.getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            const offsetPosition = elementPosition - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    const navLinks = NAV_LINKS;

    return (
        <nav
            className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-500 border-b ${
                scrolled
                ? 'bg-white/90 backdrop-blur-md shadow-lg border-gray-100 h-20 md:h-24'
                : 'bg-transparent border-transparent h-24 md:h-32'
            }`}
        >
            <div 
                className="absolute bottom-0 left-0 h-[3px] bg-primary transition-all duration-200 z-50"
                style={{ width: `${scrollProgress}%` }}
            ></div>

            <div className="container mx-auto px-6 h-full flex items-center justify-between transition-all duration-500">
                    
                    <div className="flex items-center gap-4 group cursor-pointer" onClick={() => scrollToSection('inicio')}>
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary blur-2xl opacity-0 group-hover:opacity-40 transition-opacity"></div>
                            <img 
                                src={logo} 
                                alt="INAVET" 
                                className={`transition-all duration-500 object-contain relative z-10 
                                    ${scrolled ? 'h-12 md:h-16' : 'h-20 md:h-28'}
                                `} 
                            />
                        </div>
                        <div className="flex flex-col">
                            <span className={`font-black tracking-tighter leading-none transition-colors duration-500 
                                ${scrolled ? 'text-secondary text-xl md:text-2xl' : 'text-white text-3xl md:text-4xl'}
                            `}>
                                INAVET
                            </span>
                        </div>
                    </div>

                <div className="hidden md:flex items-center space-x-2">
                    {navLinks.map((link) => (
                        <button
                                    key={link.name}
                                    onClick={() => scrollToSection(link.id)}
                                    className={`relative font-black uppercase text-sm tracking-widest group px-3 py-2 transition-all duration-300
                                        ${scrolled 
                                            ? activeSection === link.id ? 'text-primary' : 'text-gray-700 hover:text-secondary' 
                                            : activeSection === link.id ? 'text-primary' : 'text-white hover:text-white'
                                        }
                                    `}
                                    aria-label={`Navegar a ${link.name}`}
                                >
                                    {link.name}
                                    <span className={`absolute bottom-0 left-3 h-1 bg-primary transition-all duration-300 rounded-full ${activeSection === link.id ? 'w-2/3' : 'w-0 group-hover:w-2/3'}`}></span>
                                </button>
                            ))}
                            <button
                                onClick={() => scrollToSection('contacto')}
                                className={`font-black text-sm uppercase tracking-widest transition-all transform hover:scale-105 active:scale-95 shadow-lg px-8 py-3 rounded-full 
                                    ${scrolled 
                                        ? 'bg-secondary text-white shadow-secondary/20 hover:bg-secondary-hover' 
                                        : 'bg-white text-secondary shadow-white/10 hover:bg-gray-100'
                                    }
                                `}
                                aria-label="Ir a la sección de contacto"
                            >
                                Contacto
                            </button>
                            <a
                                href="/login"
                                className={`font-black text-sm uppercase tracking-widest transition-all transform hover:scale-105 active:scale-95 shadow-lg px-6 py-3 rounded-full flex items-center gap-1.5
                                    ${scrolled 
                                        ? 'bg-primary text-slate-950 shadow-primary/20 hover:bg-primary-hover' 
                                        : 'bg-primary text-slate-950 shadow-primary/30 hover:bg-primary-hover'
                                    }
                                `}
                                aria-label="Ingresar al Aula Virtual"
                            >
                                INGRESAR
                            </a>
                </div>

                <div className="md:hidden">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className={`p-3 rounded-2xl transition-all duration-300 ${
                            scrolled ? 'text-secondary bg-gray-100' : 'text-white bg-white/20 backdrop-blur-sm'
                        }`}
                    >
                        {isOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>
            </div>

            <div className={`md:hidden absolute top-full left-0 w-full transition-all duration-500 ease-in-out overflow-hidden ${
                isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
            }`}>
                <div className="bg-white/95 backdrop-blur-md shadow-2xl border-t border-gray-100 py-8 px-6 flex flex-col gap-3">
                    {navLinks.map((link, index) => (
                        <button
                            key={link.name}
                            onClick={() => scrollToSection(link.id)}
                            className="w-full py-4 px-6 text-secondary font-black text-lg hover:bg-primary/10 hover:text-primary transition-all flex items-center justify-between rounded-2xl border border-gray-100 hover:border-primary/30 group active:scale-[0.98]"
                            style={{ 
                                animation: `fade-in-up 0.5s ease-out forwards ${index * 0.1}s`,
                                opacity: 0 
                            }}
                            aria-label={`Navegar a ${link.name}`}
                        >
                            <span>{link.name}</span>
                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all transform group-hover:rotate-12">
                                <ChevronRight size={18} />
                            </div>
                        </button>
                    ))}
                    <a
                        href="/login"
                        className="w-full py-4 px-6 bg-primary text-slate-950 font-black text-lg transition-all flex items-center justify-between rounded-2xl shadow-md group active:scale-[0.98]"
                    >
                        <span>INGRESAR AL AULA</span>
                        <ChevronRight size={18} />
                    </a>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
