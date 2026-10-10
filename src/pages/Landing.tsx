import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import HowItWorks from '@/components/landing/HowItWorks';
import Activities from '@/components/landing/Activities';
import ClubeEstendido from '@/components/landing/ClubeEstendido';
import ForWho from '@/components/landing/ForWho';
import Testimonial from '@/components/landing/Testimonial';
import PracticalInfo from '@/components/landing/PracticalInfo';
import Footer from '@/components/landing/Footer';

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <HowItWorks />
      <Activities />
      <ClubeEstendido />
      <ForWho />
      <Testimonial />
      <PracticalInfo />
      <Footer />
    </div>
  );
}
