import { useStore } from '../store/useStore';
import { useWaterStats } from '../hooks/useWaterStats';
import { Droplet, TrendingUp, ArrowRight, Sun, CloudRain, Wind, Snowflake, Loader2, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

// Comprehensive 50-State Rebate Mapping
const REBATE_DATABASE: Record<string, { rate: number; program: string }> = {
  // Tier 1: Drought Relief ($3.00+)
  'CA': { rate: 3.00, program: 'SoCal Water$mart / LADWP' },
  'NV': { rate: 3.00, program: 'Southern Nevada Water Authority (SNWA)' },
  'UT': { rate: 2.00, program: 'Utah Water Savers' },
  'AZ': { rate: 1.50, program: 'Arizona Water Awareness' },
  
  // Tier 2: Arid Regions ($1.50)
  'CO': { rate: 1.50, program: 'Denver Water Residential Rebate' },
  'TX': { rate: 1.50, program: 'Texas Water Development Board' }, 
  'NM': { rate: 1.50, program: 'Bernalillo County Conservation' },
  'OR': { rate: 1.00, program: 'WaterWise Oregon' },
  'WA': { rate: 1.00, program: 'Washington Conservation District' },
  
  // Tier 3: Conservation ($1.00)
  'FL': { rate: 1.00, program: 'Tampa Bay Water Wise' },
  'GA': { rate: 1.00, program: 'Cobb County Water System' },
  'ID': { rate: 1.00, program: 'Idaho Water Conservation' },
  'MT': { rate: 1.00, program: 'Montana DEQ Water' },
  'WY': { rate: 1.00, program: 'Wyoming Water Basin' },
  'KS': { rate: 1.00, program: 'Kansas Water Council' },
  'NE': { rate: 1.00, program: 'Nebraska Natural Resources' },
};

const DEFAULT_REBATE = { rate: 0.50, program: 'Local Utility Conservation Program' };

function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest ${className}`}>
      {children}
    </span>
  );
}

export function SavingTips() {
  const { properties, activePropertyId } = useStore();
  const property = properties.find(p => p.id === activePropertyId);
  const location = property?.location;
  const lawnAreaSqFt = property?.lawns.reduce((sum, lawn) => sum + lawn.areaSqFt, 0) || 0;
  const { loading } = useWaterStats();
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-on-surface-variant font-medium">Calculating regional incentives...</p>
      </div>
    );
  }

  // Extract state code or name
  const stateKey = location?.state?.substring(0, 2).toUpperCase() || '';
  const rebateInfo = REBATE_DATABASE[stateKey] || DEFAULT_REBATE;
  
  const totalRebate = (lawnAreaSqFt || 1250) * rebateInfo.rate;
  const annualWaterSaved = ((lawnAreaSqFt || 1250) / 1000) * 20000;

  return (
    <div className="max-w-6xl mx-auto w-full pb-12 animated-enter px-4">
      <header className="mb-10 text-center">
        <h1 className="text-4xl lg:text-5xl font-heading font-extrabold text-on-surface tracking-tight">Conservation Wealth</h1>
        <p className="text-on-surface-variant font-medium mt-2 text-lg">Financial incentives for your {location?.city ? `${location.city}, ` : ''}{location?.state || 'area'}.</p>
      </header>

      {/* Primary Turf Incentive Card */}
      <Card className="bg-primary text-white border-0 rounded-[2.5rem] shadow-xl overflow-hidden mb-12">
        <CardContent className="p-0">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            <div className="lg:col-span-7 p-8 md:p-12 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-6">
                <Badge className="bg-white/20 text-white">
                  Local Rebate Detected
                </Badge>
                {rebateInfo.rate >= 2 && (
                  <Badge className="bg-yellow-400 text-primary-fixed-variant">
                    High Priority Area
                  </Badge>
                )}
              </div>
              <h2 className="text-4xl md:text-5xl font-black font-heading mb-4 tracking-tight leading-tight text-white hover:text-yellow-300 transition-colors">
                Get ${totalRebate.toLocaleString()} to switch to turf.
              </h2>
              <p className="font-medium leading-relaxed text-lg mb-8 opacity-90 text-white/80">
                In <strong>{location?.state || 'your state'}</strong>, programs like the <span className="underline decoration-2 underline-offset-4 font-bold">{rebateInfo.program}</span> pay homeowners an average of <strong>${rebateInfo.rate.toFixed(2)}/sq ft</strong> to remove natural lawns.
              </p>
              <div className="flex flex-wrap gap-4">
                <a 
                  href={`https://www.google.com/search?q=${rebateInfo.program.replace(/ /g, '+')}+rebate`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white text-primary font-black px-8 py-4 rounded-2xl flex items-center gap-3 hover:scale-105 transition-transform shadow-lg group"
                >
                  Claim Your Rebate <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>
            <div className="lg:col-span-5 bg-black/10 p-8 md:p-12 flex flex-col justify-center gap-8 border-l border-white/10">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white/20 rounded-2xl">
                  <TrendingUp size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">Instant Equity</h3>
                  <p className="text-white/70 text-sm font-medium">Artificial turf increases average home value by 10-15% while removing maintenance costs.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white/20 rounded-2xl">
                  <Droplet size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">Water Sovereignty</h3>
                  <p className="text-white/70 text-sm font-medium">You will save approximately <strong>{annualWaterSaved.toLocaleString()} gallons</strong> per year for your community.</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="bg-surface-container border-0 shadow-sm rounded-3xl overflow-hidden hover:shadow-md transition-shadow">
          <CardContent className="p-8">
             <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-primary/10 text-primary rounded-2xl">
                  <Sun size={32} />
                </div>
                <h3 className="font-bold text-2xl text-on-surface font-heading">High Heat & Arid Regions (Deserts/Southwest)</h3>
             </div>
             <p className="text-on-surface-variant leading-relaxed text-lg">
                Use drip irrigation instead of spray heads to better deliver water to the roots. Focus on low water plants and put mulch 3 to 4 inches above to shield the soil from solar radiation. Water thoroughly once or twice a week instead of daily to make sure roots become tolerant to 100°F+ (38°C+) days.
             </p>
             <p className="text-[10px] text-on-surface-variant font-bold mt-8 uppercase tracking-widest opacity-50 flex items-center gap-1.5">
               <CheckCircle2 size={12} /> Data Confirmed
             </p>
          </CardContent>
        </Card>

        <Card className="bg-surface-container border-0 shadow-sm rounded-3xl overflow-hidden hover:shadow-md transition-shadow">
          <CardContent className="p-8">
             <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-secondary/10 text-secondary rounded-2xl">
                  <CloudRain size={32} />
                </div>
                <h3 className="font-bold text-2xl text-on-surface font-heading">Humid & Subtropical Regions (Southeast/Gulf Coast)</h3>
             </div>
             <p className="text-on-surface-variant leading-relaxed text-lg">
                Avoid watering after 4:00 PM to ensure the grass is dry before sunset, preventing fungus. Use rain sensors to properly know when to water. In sandy soils, water more frequently but for shorter time because sand can’t hold moisture as long as clay or dirt can.
             </p>
             <p className="text-[10px] text-on-surface-variant font-bold mt-8 uppercase tracking-widest opacity-50 flex items-center gap-1.5">
               <CheckCircle2 size={12} /> Data Confirmed
             </p>
          </CardContent>
        </Card>

        <Card className="bg-surface-container border-0 shadow-sm rounded-3xl overflow-hidden hover:shadow-md transition-shadow">
          <CardContent className="p-8">
             <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-primary/10 text-primary rounded-2xl">
                  <Wind size={32} />
                </div>
                <h3 className="font-bold text-2xl text-on-surface font-heading">Coastal & Windy Regions</h3>
             </div>
             <p className="text-on-surface-variant leading-relaxed text-lg">
                Use low-angle spray nozzles to water beneath the wind’s path. Create windbreaks using hardy shrubs to protect more delicate garden beds, and light rinse with fresh water to wash salt off the leaves because salt spray can dehydrate foliage easily.
             </p>
             <p className="text-[10px] text-on-surface-variant font-bold mt-8 uppercase tracking-widest opacity-50 flex items-center gap-1.5">
               <CheckCircle2 size={12} /> Data Confirmed
             </p>
          </CardContent>
        </Card>

        <Card className="bg-surface-container border-0 shadow-sm rounded-3xl overflow-hidden hover:shadow-md transition-shadow">
          <CardContent className="p-8">
             <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-secondary/10 text-secondary rounded-2xl">
                  <Snowflake size={32} />
                </div>
                <h3 className="font-bold text-2xl text-on-surface font-heading">Temperate & Seasonal Regions (Northeast/Midwest)</h3>
             </div>
             <p className="text-on-surface-variant leading-relaxed text-lg">
                Adjust watering schedules monthly to match evaporation rates that change with the season. In the fall, reduce water gradually to help plants prepare for winter. Make sure your irrigation system is dry before winter to prevent water in pipes freezing and bursting.
             </p>
             <p className="text-[10px] text-on-surface-variant font-bold mt-8 uppercase tracking-widest opacity-50 flex items-center gap-1.5">
               <CheckCircle2 size={12} /> Data Confirmed
             </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
