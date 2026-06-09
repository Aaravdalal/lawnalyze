import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';

const LOAD_STEPS = [
  'Loading images…',
  'Loading fonts…',
  'Initializing app…',
  'Ready!',
];

export function Splash() {
  const setOnboardingStep = useStore((state) => state.setOnboardingStep);
  const [progress, setProgress] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);
  const [loadingDone, setLoadingDone] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const resources = [
      new Promise<void>((resolve) => {
        const img = new Image();
        img.src = '/lawnalyze-logo.png';
        if (img.complete) resolve();
        else {
          img.onload = () => resolve();
          img.onerror = () => resolve();
        }
      }),
      new Promise<void>((resolve) => {
        if (document.fonts && document.fonts.ready) {
          document.fonts.ready.then(() => resolve());
        } else {
          resolve();
        }
      }),
      new Promise<void>((resolve) => {
        if (document.readyState === 'complete') {
          resolve();
        } else {
          window.addEventListener('load', () => resolve());
          setTimeout(resolve, 1000); // Fallback
        }
      })
    ];

    let loadedCount = 0;
    resources.forEach((promise) => {
      promise.then(() => {
        if (!isMounted) return;
        loadedCount++;
        setProgress(Math.min(100, Math.floor((loadedCount / resources.length) * 100)));
      });
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const idx = Math.min(Math.floor((progress / 100) * LOAD_STEPS.length), LOAD_STEPS.length - 1);
    setStepIdx(idx);
    if (progress >= 100) {
      const t = setTimeout(() => setLoadingDone(true), 600);
      return () => clearTimeout(t);
    }
  }, [progress]);

  return (
    <AnimatePresence>
      {!loadingDone ? (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 flex flex-col items-center justify-center bg-[#f5f7f0] overflow-hidden z-[999]"
        >
          {/* Animated gradients */}
          <div className="pointer-events-none fixed top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-green-400/35 via-emerald-300/20 to-transparent blur-3xl animate-drift-slow" />
          <div className="pointer-events-none fixed bottom-[-15%] left-[-10%] w-[55%] h-[80%] rounded-full bg-gradient-to-tr from-green-500/30 via-emerald-400/15 to-transparent blur-3xl animate-drift-slow-reverse" />

          {/* Logo */}
          <motion.img
            src="/lawnalyze-logo.png"
            alt="Lawnalyze"
            className="w-[340px] md:w-[420px] select-none mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            draggable={false}
          />

          {/* Progress bar */}
          <div className="w-64 md:w-80 flex flex-col items-center gap-4">
            <div className="w-full h-1.5 bg-[#d6dcc8] rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #2e7d32, #4caf50, #66bb6a)' }}
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ ease: 'easeOut', duration: 0.15 }}
              />
            </div>
            <AnimatePresence mode="wait">
              <motion.p
                key={stepIdx}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="text-[13px] font-medium text-[#5a6650] tracking-wide"
              >
                {LOAD_STEPS[stepIdx]}
              </motion.p>
            </AnimatePresence>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="ready"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 flex flex-col items-center justify-center bg-[#f5f7f0] overflow-hidden z-[999]"
        >
          {/* Animated gradients */}
          <div className="pointer-events-none fixed top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-green-400/35 via-emerald-300/20 to-transparent blur-3xl animate-drift-slow" />
          <div className="pointer-events-none fixed bottom-[-15%] left-[-10%] w-[55%] h-[80%] rounded-full bg-gradient-to-tr from-green-500/30 via-emerald-400/15 to-transparent blur-3xl animate-drift-slow-reverse" />

          <motion.img
            src="/lawnalyze-logo.png"
            alt="Lawnalyze"
            className="w-[340px] md:w-[420px] select-none mb-10"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            draggable={false}
          />

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl font-medium text-[#5a6650] mb-10 text-center px-6"
          >
            Data-driven water conservation for a greener future.
          </motion.p>

          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setOnboardingStep('address')}
            className="bg-[#2e7d32] text-white font-bold text-lg px-14 py-4 rounded-full shadow-lg hover:bg-[#1b5e20] transition-colors"
          >
            Get Started
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
