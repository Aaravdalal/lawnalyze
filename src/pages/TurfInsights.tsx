import { useStore } from '../store/useStore';
import { useWaterStats } from '../hooks/useWaterStats';
import { Droplet, Calculator, Loader2, DollarSign, Bath } from 'lucide-react';
import { WaterDropVisualizer } from '../components/BathtubVisualizer';
import { PLANT_FACTOR } from '../lib/waterMath';

// Average US bathtub holds ~36 gallons (EPA)
const BATHTUB_GALLONS = 36;

// National Average Water Rates (cost per gallon)
const WATER_RATES: Record<string, number> = {
  'CA': 0.012, 'CALIFORNIA': 0.012,
  'NV': 0.008, 'NEVADA': 0.008,
  'AZ': 0.006, 'ARIZONA': 0.006,
  'TX': 0.006, 'TEXAS': 0.006,
  'UT': 0.005, 'UTAH': 0.005,
  'FL': 0.005, 'FLORIDA': 0.005,
  'CO': 0.007, 'COLORADO': 0.007,
  'WA': 0.008, 'WASHINGTON': 0.008,
  'NY': 0.010, 'NEW YORK': 0.010,
};
const DEFAULT_RATE = 0.006; // National avg

export function TurfInsights() {
  const { stats, loading } = useWaterStats();
  const { properties, activePropertyId } = useStore();
  const property = properties.find(p => p.id === activePropertyId);
  const location = property?.location;

  if (loading || !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-on-surface-variant font-medium">Calculating volumetric impact...</p>
      </div>
    );
  }

  const { gallons: estimatedGallonsPerWeek, eto, rain, cityName } = stats;
  const estimatedGallonsPerYear = estimatedGallonsPerWeek * 52;
  const bathtubsPerWeek = +(estimatedGallonsPerWeek / BATHTUB_GALLONS).toFixed(1);
  const bathtubsPerYear = Math.round(estimatedGallonsPerYear / BATHTUB_GALLONS);

  // Generate array of bathtub icons, capped at 20 for visual display  
  const bathtubCount = Math.min(Math.ceil(bathtubsPerWeek), 20);

  // Calculate Costs
  const stateRaw = location?.state?.toUpperCase() || '';
  const mappedStateKey = Object.keys(WATER_RATES).find(k => stateRaw.includes(k)) || '';
  const ratePerGal = WATER_RATES[mappedStateKey] || DEFAULT_RATE;
  const weeklyCost = estimatedGallonsPerWeek * ratePerGal;
  const annualCost = estimatedGallonsPerYear * ratePerGal;

  return (
    <div className="max-w-6xl mx-auto w-full pb-12 animated-enter px-4">
       <header className="mb-10 text-center">
        <h1 className="text-4xl lg:text-5xl font-heading font-extrabold text-on-surface tracking-tight">Detailed Usage</h1>
        <p className="text-on-surface-variant font-medium mt-2 text-lg">See the financial and ecological impact of your specific climate profile.</p>
      </header>
      
      {/* Hero Banner */}
      <div className="w-full bg-[#f1f2ec] rounded-[1.5rem] p-6 lg:px-8 lg:py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="w-[72px] h-[72px] rounded-full bg-[#707968] flex items-center justify-center shrink-0">
            <Droplet size={30} className="text-[#1a1b19]" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col justify-center">
            <h2 className="text-[20px] font-bold text-[#1a1b19] tracking-normal mb-0.5">Estimated Water Usage</h2>
            <p className="text-[#515c4b] font-medium text-[15px]">Corrected for <strong>{rain}"</strong> of local rainfall</p>
          </div>
        </div>
        <div className="md:text-right flex flex-col items-start md:items-end justify-center">
          <div className="flex items-baseline gap-1.5 mb-1 pt-1">
            <span className="text-[46px] font-bold text-[#1a1b19] tracking-tight leading-none font-sans">{estimatedGallonsPerWeek.toLocaleString()}</span>
            <span className="text-[19px] font-bold text-[#1a1b19] tracking-tight font-sans">gal/week</span>
          </div>
          <span className="text-[16px] font-bold text-[#1a1b19] tracking-tight font-sans">{estimatedGallonsPerYear.toLocaleString()} gal/year</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        <div className="lg:col-span-7 flex flex-col gap-8">
          <WaterDropVisualizer gallons={estimatedGallonsPerWeek} />
        </div>

        {/* Bathtub Comparison Card */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-surface-container rounded-[2rem] p-8 shadow-sm flex flex-col h-full border border-surface-variant/20">
            <h3 className="text-2xl font-bold font-heading text-on-surface mb-2 flex items-center gap-2">
              <Bath size={24} className="text-primary" /> In Bathtubs
            </h3>
            <p className="text-on-surface-variant font-medium mb-6">
              Your weekly water usage fills roughly <strong className="text-primary text-2xl">{bathtubsPerWeek}</strong> standard bathtubs. That's <strong>{bathtubsPerYear.toLocaleString()}</strong> per year.
            </p>

            {/* Visual bathtub grid */}
            <div className="flex flex-wrap gap-2 mb-6">
              {Array.from({ length: bathtubCount }).map((_, i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-on-surface opacity-80"
                  title={`Bathtub ${i + 1}`}
                >
                  <Bath size={20} strokeWidth={2.5} />
                </div>
              ))}
              {bathtubsPerWeek > 20 && (
                <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-xs font-bold text-primary">
                  +{Math.ceil(bathtubsPerWeek) - 20}
                </div>
              )}
            </div>

            {/* Dropdown with math */}
            <details className="group bg-surface-variant rounded-2xl overflow-hidden [&_summary::-webkit-details-marker]:hidden cursor-pointer mt-auto">
              <summary className="flex items-center justify-between p-4 font-bold text-sm select-none hover:bg-surface-container-high transition-colors">
                <div className="flex items-center gap-2">
                  <Calculator className="text-primary w-4 h-4" />
                  <span>View Calculation</span>
                </div>
                <span className="transition group-open:rotate-180 bg-surface-container p-1.5 rounded-full">
                  <svg fill="none" height="16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="16"><path d="M6 9l6 6 6-6"></path></svg>
                </span>
              </summary>
              <div className="p-4 pt-0 text-on-surface-variant border-t border-surface-container/10">
                <div className="space-y-3 pt-4 font-mono text-sm">
                  <div className="flex justify-between border-b border-surface-container/20 pb-2">
                    <span>ETo ({cityName}):</span> <strong>{eto} in/week</strong>
                  </div>
                  <div className="flex justify-between border-b border-surface-container/20 pb-2">
                    <span>Local Rainfall:</span> <strong className="text-secondary">-{rain} in/week</strong>
                  </div>
                  <div className="flex justify-between border-b border-surface-container/20 pb-2">
                    <span>Lawn Factor:</span> <strong>{PLANT_FACTOR}</strong>
                  </div>
                  <div className="flex justify-between border-b border-surface-container/20 pb-2">
                    <span>Weekly usage:</span>
                    <strong>{estimatedGallonsPerWeek.toLocaleString()} gal</strong>
                  </div>
                  <div className="flex justify-between border-t border-surface-container pt-3">
                    <span>Bathtubs / year:</span>
                    <strong>{bathtubsPerWeek} × 52 = {bathtubsPerYear.toLocaleString()}</strong>
                  </div>
                </div>
              </div>
            </details>
          </div>
        </div>
      </div>

      {/* NEW: Financial Cost Accurate Card */}
      <div className="bg-surface-container rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-surface-variant/20 flex flex-col md:flex-row items-center gap-8 justify-between">
        <div className="flex items-start gap-6">
          <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center shrink-0">
             <DollarSign size={32} className="text-secondary" />
          </div>
          <div>
            <h3 className="text-2xl font-bold font-heading mb-2">Estimated Water Cost</h3>
            <p className="text-on-surface-variant text-lg">
              Based on the current water utility rate for <strong>{location?.state || 'your area'}</strong> 
              <br className="hidden md:block"/> 
              (approx. <span className="font-mono bg-surface-variant px-1 rounded">${ratePerGal.toFixed(3)}</span> per gallon).
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end shrink-0 w-full md:w-auto text-right">
           <div className="bg-white px-6 py-4 rounded-3xl shadow-sm border border-surface-variant/10 text-center w-full md:w-auto">
             <p className="text-xs uppercase font-black text-on-surface-variant/60 tracking-widest mb-1">Yearly Cost to Water</p>
             <p className="text-4xl md:text-5xl font-black text-secondary font-heading">${annualCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
             <p className="text-sm font-bold text-on-surface mt-2">${weeklyCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / week</p>
           </div>
        </div>
      </div>

    </div>
  );
}
