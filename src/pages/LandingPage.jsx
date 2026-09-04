import React, { Suspense, lazy } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import InavetInfo from '../components/InavetInfo';
import AssistantsCarousel from '../components/AssistantsCarousel';
import Modality from '../components/Modality';
import TargetAudience from '../components/TargetAudience';
import ScrollReveal from '../components/ScrollReveal';
import WhatsAppButton from '../components/WhatsAppButton';
import Outcome from '../components/Outcome';
import AcademicDirection from '../components/AcademicDirection';

const Pricing = lazy(() => import('../components/Pricing'));
const EnrollCTA = lazy(() => import('../components/EnrollCTA'));
const FAQ = lazy(() => import('../components/FAQ'));
const FinalCTA = lazy(() => import('../components/FinalCTA'));
const Footer = lazy(() => import('../components/Footer'));

const LandingPage = () => {
  return (
    <div className="font-sans antialiased text-gray-900 bg-primary overflow-x-hidden">
      <Navbar />
      <Hero />
      
      <ScrollReveal>
        <TargetAudience />
      </ScrollReveal>

      <ScrollReveal>
        <Outcome />
      </ScrollReveal>

      <ScrollReveal delay={100}>
        <AssistantsCarousel />
      </ScrollReveal>
      
      <ScrollReveal delay={200}>
        <Modality />
      </ScrollReveal>

      <ScrollReveal>
        <InavetInfo />
      </ScrollReveal>

      <ScrollReveal>
        <AcademicDirection />
      </ScrollReveal>
      
      <Suspense fallback={
        <div className="py-24 container mx-auto px-4 space-y-12">
          <div className="h-12 bg-white/20 rounded-full w-48 animate-pulse mx-auto"></div>
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-white/20 rounded-4xl animate-pulse"></div>
            ))}
          </div>
        </div>
      }>
        <ScrollReveal>
          <Pricing />
        </ScrollReveal>

        <EnrollCTA />
        
        <ScrollReveal>
          <FAQ />
        </ScrollReveal>
        
        <FinalCTA />
        
        <Footer />
      </Suspense>

      <WhatsAppButton />
    </div>
  );
};

export default LandingPage;
