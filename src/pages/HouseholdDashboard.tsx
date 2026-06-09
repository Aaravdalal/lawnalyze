import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Droplets, Calculator, Ruler, Sun, Loader2, CloudRain, Thermometer, Wind, Plus } from "lucide-react";
import { useStore } from "../store/useStore";
import { useWaterStats } from "../hooks/useWaterStats";
import { PLANT_FACTOR, IRRIGATION_EFFICIENCY, CONVERSION_FACTOR } from "../lib/waterMath";

export function HouseholdDashboard() {
  const { properties, activePropertyId, setActivePropertyId, setOnboardingStep } = useStore();
  const activeProperty = properties.find(p => p.id === activePropertyId);
  const lawnAreaSqFt = activeProperty?.lawns.reduce((sum, lawn) => sum + lawn.areaSqFt, 0) || 0;
  

  const { stats, loading } = useWaterStats();

  if (loading || !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-on-surface-variant font-medium">Analyzing local climate data...</p>
      </div>
    );
  }

  const { eto, rain, netInches, gallons: weeklyWaterEstimate, cityName, isLive } = stats;
  const yearlyWaterEstimate = weeklyWaterEstimate * 52;

  return (
    <div className="max-w-6xl mx-auto w-full pb-12 pt-8 px-4">
      <header className="mb-10 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-4xl lg:text-5xl font-heading font-extrabold text-on-surface tracking-tight mb-2 md:text-left text-center">Lawn Analysis Complete</h1>
          <p className="text-on-surface-variant font-medium text-lg md:text-left text-center">We successfully processed your property boundaries.</p>
        </div>
        {properties.length > 0 && (
          <div className="flex items-center gap-2">
            <select 
              value={activePropertyId || ''} 
              onChange={(e) => setActivePropertyId(e.target.value)}
              className="w-[200px] bg-surface px-4 py-2 border border-surface-variant rounded-xl font-bold text-on-surface outline-none"
            >
              {properties.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <button onClick={() => setOnboardingStep('address')} className="p-2.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-xl transition-colors title='Add Property'">
              <Plus size={20} />
            </button>
          </div>
        )}
      </header>
      
      <div className="flex flex-col gap-6">
        
        {/* Core Calculation Card */}
        <Card className="bg-surface-container-lowest border-0 shadow-2xl rounded-[32px] overflow-hidden">
          <CardHeader className="bg-primary/5 pb-8 pt-8">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="p-3 bg-primary text-white rounded-2xl shadow-ambient">
                <Ruler className="w-8 h-8" />
              </div>
            </div>
            <CardTitle className="text-xl font-heading font-extrabold text-center text-primary uppercase tracking-widest">Detected Lawn Area</CardTitle>
            <div className="text-center mt-4">
              <span className="text-7xl font-heading font-black">{lawnAreaSqFt.toLocaleString()}</span>
              <span className="text-2xl font-bold text-on-surface-variant ml-2">SQ FT</span>
            </div>
          </CardHeader>

          <CardContent className="p-8">
            <div className="bg-surface-container p-6 rounded-2xl mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-tertiary-container text-on-tertiary-container rounded-full">
                  <Droplets className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-on-surface">Estimated Water Usage</h3>
                  <p className="text-on-surface-variant">Based on your specific dimensions</p>
                </div>
              </div>
              <div className="text-right flex flex-col items-end">
                <span className="text-4xl font-black font-heading text-tertiary">{weeklyWaterEstimate.toLocaleString()} <span className="text-xl text-on-surface-variant">gal/week</span></span>
                <span className="text-xl font-bold text-on-surface-variant mt-1">{yearlyWaterEstimate.toLocaleString()} gal/year</span>
              </div>
            </div>

            {/* Individual Lawns Breakdown */}
            {activeProperty && activeProperty.lawns.length > 1 && (
              <div className="mb-8">
                <h4 className="font-bold text-on-surface mb-4">Lawn Section Breakdown</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {activeProperty.lawns.map(lawn => {
                    // Simple proportional estimate
                    const proportion = lawnAreaSqFt > 0 ? lawn.areaSqFt / lawnAreaSqFt : 0;
                    const lawnWeekly = Math.round(weeklyWaterEstimate * proportion);
                    return (
                      <div key={lawn.id} className="bg-surface-container-lowest border border-surface-variant p-4 rounded-xl shadow-sm">
                        <div className="font-bold text-on-surface mb-1">{lawn.name}</div>
                        <div className="text-sm text-on-surface-variant flex justify-between">
                          <span>{lawn.areaSqFt.toLocaleString()} sq ft</span>
                          <span className="font-bold text-tertiary">{lawnWeekly.toLocaleString()} gal/wk</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Dropdown Reasoning */}
            <details className="group bg-surface-variant rounded-2xl overflow-hidden [&_summary::-webkit-details-marker]:hidden cursor-pointer">
              <summary className="flex items-center justify-between p-6 font-bold text-lg select-none hover:bg-surface-container-high transition-colors">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <Calculator className="text-primary w-6 h-6" />
                    <span>View Precision Analysis & Methodology</span>
                  </div>
                  <span className="text-sm text-on-surface-variant ml-9 font-normal">Explore how satellite mapping and real-time weather calculate this figure</span>
                </div>
                <span className="transition group-open:rotate-180 bg-surface-container p-2 rounded-full">
                  <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                </span>
              </summary>
              <div className="p-6 pt-0 text-on-surface-variant border-t border-surface-container/10">
                <div className="space-y-6 pt-6">
                  
                  {/* Geospatial Explanation */}
                  <div>
                    <h4 className="font-heading font-extrabold text-on-surface mb-2 flex items-center gap-2 text-lg">
                      <Ruler className="w-5 h-5 text-primary" /> Geospatial Measurement
                    </h4>
                    <p className="text-[15px] leading-relaxed bg-surface p-4 rounded-xl shadow-sm border border-surface-container">
                      Your lawn boundary was accurately calculated using <strong>High-Resolution Web Mercator Satellite Imagery</strong>. 
                      By plotting the 4+ geodesic coordinate points you placed on the map, our engine applies a spherical polygon algorithm (via turf.js) to compute the exact curvature area over the earth, returning a highly precise area of <strong>{lawnAreaSqFt.toLocaleString()} sq ft</strong>.
                    </p>
                  </div>

                  {/* Weather & Climate Modifier */}
                  <div>
                    <h4 className="font-heading font-extrabold text-on-surface mb-2 flex items-center gap-2 text-lg">
                      <Sun className="w-5 h-5 text-tertiary" /> Climate Integration ({cityName}) {isLive ? '(Live)' : ''}
                    </h4>
                    <p className="text-[15px] leading-relaxed bg-surface p-4 rounded-xl shadow-sm border border-surface-container">
                      Water usage isn't static—it scales with the weather. Your local evaporation rate over the past 7 days for <strong>{cityName}</strong> was <strong>{eto} inches</strong>. We found <strong>{rain} inches</strong> of rain, meaning your lawn has a net water debt of <strong>{netInches} inches</strong>.
                    </p>
                  </div>
                  
                  {/* Climate Status Mini Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-surface-container-lowest rounded-xl p-4 border border-surface-variant/20 shadow-sm">
                      <div className="flex items-center gap-2 mb-1 text-on-surface-variant">
                        <Wind size={14} />
                        <p className="text-[10px] font-bold uppercase tracking-widest">Evaporation</p>
                      </div>
                      <p className="text-xl font-black text-on-surface">{eto}"</p>
                    </div>
                    <div className="bg-surface-container-lowest rounded-xl p-4 border border-surface-variant/20 shadow-sm">
                      <div className="flex items-center gap-2 mb-1 text-on-surface-variant">
                        <CloudRain size={14} />
                        <p className="text-[10px] font-bold uppercase tracking-widest">Rainfall Credit</p>
                      </div>
                      <p className="text-xl font-black text-secondary">-{rain}"</p>
                    </div>
                    <div className="bg-surface-container-lowest rounded-xl p-4 border border-surface-variant/20 shadow-sm">
                      <div className="flex items-center gap-2 mb-1 text-on-surface-variant">
                        <Thermometer size={14} />
                        <p className="text-[10px] font-bold uppercase tracking-widest">Net Depth</p>
                      </div>
                      <p className="text-xl font-black text-primary">{netInches}"</p>
                    </div>
                  </div>

                  {/* EPA Formula Breakdown */}
                  <div className="flex flex-col gap-4 text-sm font-mono bg-surface-container-lowest p-6 rounded-2xl border border-surface-variant/20">
                    <ul className="space-y-3">
                      <li className="flex justify-between border-b border-primary/20 pb-2">
                        <span>Net Water Need (ETo - Rain):</span> <strong>{netInches} inches</strong>
                      </li>
                      <li className="flex justify-between border-b border-primary/20 pb-2">
                        <span>Lawn Factor:</span> <strong>{PLANT_FACTOR}</strong>
                      </li>
                      <li className="flex justify-between border-b border-primary/20 pb-2">
                        <span>Lawn Size:</span> <strong>{lawnAreaSqFt.toLocaleString()} sq ft</strong>
                      </li>
                      <li className="flex justify-between border-b border-primary/20 pb-2">
                        <span>Conversion Factor:</span> <strong>{CONVERSION_FACTOR} gal/in·ft²</strong>
                      </li>
                      <li className="flex justify-between border-b border-primary/20 pb-2">
                        <span>Irrigation Efficiency:</span> <strong>{IRRIGATION_EFFICIENCY}</strong>
                      </li>
                      <li className="flex justify-between text-base pt-2 font-black tracking-widest text-primary">
                        <span>FORMULA:</span> <span className="text-right">({netInches} × {PLANT_FACTOR} × {lawnAreaSqFt} × {CONVERSION_FACTOR}) ÷ {IRRIGATION_EFFICIENCY}</span>
                      </li>
                    </ul>
                  </div>

                </div>
              </div>
            </details>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
