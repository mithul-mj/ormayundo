import { useState } from 'react';
import {
  Navbar,
  HeroSection,
  ExtensionShowcase,
  AnalyticsShowcase,
  DeckShowcase,
  HowItWorks,
  DownloadSection,
  ScienceSection,
  FeaturesGrid,
  CtaBanner,
  Footer,
  ImageModal,
} from './components';

export default function LandingPage({ onGetStarted, isAuthenticated }) {
  const [copiedStep, setCopiedStep] = useState(false);
  const [activeModalImg, setActiveModalImg] = useState(null);

  const handleCopyChromeUrl = () => {
    navigator.clipboard.writeText('chrome://extensions');
    setCopiedStep(true);
    setTimeout(() => setCopiedStep(false), 2000);
  };

  return (
    <div className={
      [
        'min-h-screen bg-white text-ink flex flex-col font-sans overflow-x-hidden',
        'selection:bg-brand/15 selection:text-brand'
      ].join(' ')
    }>
      <Navbar
        isAuthenticated={isAuthenticated}
        onGetStarted={onGetStarted}
      />

      <main>
        <HeroSection
          onGetStarted={onGetStarted}
        />
        <ExtensionShowcase onOpenModal={setActiveModalImg} />
        <AnalyticsShowcase
          onOpenModal={setActiveModalImg}
          onGetStarted={onGetStarted}
        />
        <DeckShowcase
          onOpenModal={setActiveModalImg}
          onGetStarted={onGetStarted}
        />
        <HowItWorks />
        <DownloadSection
          copiedStep={copiedStep}
          onCopyChromeUrl={handleCopyChromeUrl}
        />
        <ScienceSection />
        <FeaturesGrid />
        <CtaBanner
          isAuthenticated={isAuthenticated}
          onGetStarted={onGetStarted}
        />
      </main>

      <Footer />

      <ImageModal
        activeModalImg={activeModalImg}
        onClose={() => setActiveModalImg(null)}
      />
    </div>
  );
}

