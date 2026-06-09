import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Sun, Sunrise, CloudRain, Droplet, Info, Thermometer, CloudSun, Cloud, CloudSnow, CloudLightning, Loader2 } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useStore } from "../store/useStore";
import { fetchWeekForecast, findBestWateringDay, type DayForecast } from "../lib/weather";

/* ────── Map WMO codes to lucide icons ────── */
function weatherIcon(code: number) {
  if (code === 0) return Sun;
  if (code <= 3) return CloudSun;
  if (code <= 48) return Cloud;
  if (code <= 67) return CloudRain;
  if (code <= 77) return CloudSnow;
  if (code <= 86) return CloudSnow;
  if (code >= 95) return CloudLightning;
  return Cloud;
}

/* ────── Time Blocks ────── */
const TIME_BLOCKS = [
  { label: '12 AM – 5 AM', status: 'off' as const,         desc: 'System Idle' },
  { label: '5 AM – 8 AM',  status: 'optimal' as const,     desc: 'Optimal Watering Window' },
  { label: '9 AM – 4 PM',  status: 'evaporation' as const, desc: 'High Evaporation Risk — avoid watering' },
  { label: '5 PM – 11 PM', status: 'fungal' as const,      desc: 'Fungal Disease Risk — grass stays wet overnight' },
];

const statusIcon = (s: string) => {
  switch (s) {
    case 'optimal': return Sunrise;
    case 'evaporation': return Sun;
    case 'fungal': return CloudRain;
    default: return Clock;
  }
};

/* ──────────────────────────────── Component ─────────────────────── */
export function Schedule() {
  const { properties, activePropertyId } = useStore();
  const property = properties.find(p => p.id === activePropertyId);
  const location = property?.location;
  const [forecast, setForecast] = useState<DayForecast[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch real weather on mount
  useEffect(() => {
    setLoading(true);
    setError(null);
    const lat = location?.coords?.[0];
    const lon = location?.coords?.[1];
    fetchWeekForecast(lat, lon)
      .then((data) => {
        setForecast(data);
        setSelectedDay(findBestWateringDay(data));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [location?.coords?.[0], location?.coords?.[1]]);

  const bestDayIdx = useMemo(
    () => (forecast ? findBestWateringDay(forecast) : 0),
    [forecast]
  );

  const [selectedDay, setSelectedDay] = useState(0);
  const isWateringDay = selectedDay === bestDayIdx;

  const cityLabel = location?.city || 'your area';

  // Loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto w-full pb-12 animated-enter flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-on-surface-variant font-medium text-lg">Fetching live forecast for {cityLabel}…</p>
      </div>
    );
  }

  // Error state
  if (error || !forecast) {
    return (
      <div className="max-w-7xl mx-auto w-full pb-12 animated-enter flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <CloudRain className="w-10 h-10 text-error" />
        <p className="text-on-surface-variant font-medium text-lg">
          Couldn't load weather data. {error}
        </p>
      </div>
    );
  }

  const sel = forecast[selectedDay];
  const WeatherIcon = weatherIcon(sel.weatherCode);
  const bestDay = forecast[bestDayIdx];

  return (
    <div className="max-w-6xl mx-auto w-full pb-12 animated-enter">
      <header className="mb-10 text-center">
        <h1 className="text-4xl lg:text-5xl font-heading font-extrabold text-on-surface tracking-tight">Watering Schedule</h1>
        <p className="text-on-surface-variant font-medium mt-2 text-lg">
          Live 7-day forecast for <strong>{cityLabel}</strong> · water <strong>once per week</strong> on the optimal day.
        </p>
      </header>

      {/* ── Week Strip ── */}
      <div className="flex gap-3 justify-center flex-wrap pb-4 mb-8">
        {forecast.map((day, idx) => {
          const isBest = idx === bestDayIdx;
          const isSelected = idx === selectedDay;
          const DayIcon = weatherIcon(day.weatherCode);
          return (
            <button
              key={idx}
              onClick={() => setSelectedDay(idx)}
              className={`flex-shrink-0 w-[110px] rounded-3xl flex flex-col items-center justify-center py-4 px-2 transition-all border-2 ${
                isSelected
                  ? isBest
                    ? 'bg-primary text-white shadow-lg scale-105 border-primary'
                    : 'bg-surface-container-high text-on-surface shadow-md scale-105 border-primary/50'
                  : isBest
                    ? 'bg-primary/10 text-primary border-primary/30 hover:bg-primary/20'
                    : 'bg-surface-container text-on-surface-variant border-transparent hover:bg-surface-container-high'
              }`}
            >
              <span className="text-xs font-bold uppercase tracking-wider mb-1 opacity-80">{day.day}</span>
              <span className="text-2xl font-bold font-heading mb-2">{day.date}</span>
              <DayIcon size={20} className="mb-2 opacity-70" />
              <span className="text-[13px] font-semibold">{day.tempHigh}°F</span>
              {day.rainChance > 0 && (
                <span className="text-[11px] font-medium opacity-70 mt-0.5">🌧 {day.rainChance}%</span>
              )}
              {isBest && (
                <Badge className="mt-2 bg-primary/20 text-primary border-0 text-[10px] font-black uppercase tracking-widest px-2 py-0.5">
                  Best
                </Badge>
              )}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ── Day Detail ── */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedDay}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-4"
            >
              {/* Weather summary */}
              <Card className="border-0 rounded-[2rem] bg-surface-container-lowest shadow-sm overflow-hidden">
                <CardContent className="p-6 md:p-8 flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="p-4 bg-surface-container-high rounded-2xl">
                      <WeatherIcon size={32} className="text-on-surface" />
                    </div>
                    <div>
                      <h3 className="font-bold text-2xl font-heading text-on-surface">{sel.condition}</h3>
                      <div className="flex items-center gap-4 mt-1 text-on-surface-variant font-medium text-[15px]">
                        <span className="flex items-center gap-1"><Thermometer size={14} /> {sel.tempHigh}°F / {sel.tempLow}°F</span>
                        <span className="flex items-center gap-1"><CloudRain size={14} /> {sel.rainChance}% rain</span>
                        {sel.precipIn > 0 && (
                          <span className="flex items-center gap-1"><Droplet size={14} /> {sel.precipIn}"</span>
                        )}
                      </div>
                    </div>
                  </div>
                  {isWateringDay ? (
                    <Badge className="bg-primary text-white font-bold px-4 py-2 rounded-xl text-sm hidden md:flex items-center gap-2 shadow-sm border-0">
                      <Droplet size={16} strokeWidth={2.5} /> BEST DAY TO WATER
                    </Badge>
                  ) : (
                    <Badge className="bg-surface-container text-on-surface-variant font-bold px-4 py-2 rounded-xl text-sm hidden md:flex items-center gap-2 border-0">
                      NO WATERING
                    </Badge>
                  )}
                </CardContent>
              </Card>

              {/* Timeline blocks */}
              {TIME_BLOCKS.map((block, i) => {
                const Icon = statusIcon(block.status);
                const isOptimal = block.status === 'optimal' && isWateringDay;
                const isDisabled = block.status === 'optimal' && !isWateringDay;
                return (
                  <Card
                    key={i}
                    className={`border-0 rounded-[2rem] overflow-hidden transition-all ${
                      isOptimal
                        ? 'bg-primary/10 border-2 border-primary/20'
                        : isDisabled
                          ? 'bg-surface-container-lowest border border-surface-variant/20 opacity-50'
                          : 'bg-surface-container-lowest border border-surface-variant/20'
                    }`}
                  >
                    <CardContent className="p-5 md:p-7 flex items-center justify-between">
                      <div className="flex items-center gap-5">
                        <div className={`p-3 rounded-2xl ${isOptimal ? 'bg-primary text-white shadow-sm' : 'bg-surface-container-high text-on-surface-variant'}`}>
                          <Icon size={24} />
                        </div>
                        <div>
                          <h3 className={`font-bold text-lg md:text-xl tracking-tight ${isOptimal ? 'text-primary font-heading' : 'text-on-surface'}`}>
                            {block.label}
                          </h3>
                          <p className={`font-medium text-sm ${isOptimal ? 'text-primary/80' : 'text-on-surface-variant'}`}>
                            {isDisabled ? 'Skipped — not the optimal watering day' : block.desc}
                          </p>
                        </div>
                      </div>
                      {isOptimal && (
                        <Badge className="bg-primary text-white font-bold px-3 py-1.5 rounded-xl text-xs hidden md:flex items-center gap-2 shadow-sm border-0 tracking-wide">
                          <Droplet size={14} strokeWidth={2.5} /> BEST TIME PERIOD
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Sidebar ── */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <Card className="bg-surface-container text-on-surface-variant border-0 rounded-[2rem] shadow-sm overflow-hidden">
            <CardContent className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Info className="text-primary" size={24} />
                </div>
                <h3 className="text-2xl font-bold text-on-surface font-heading">Why Dawn?</h3>
              </div>
              <p className="leading-relaxed mb-6 font-medium text-[17px]">
                Watering between <strong>5:00 AM and 8:00 AM</strong> makes sure that your lawn gets all the water it needs before the days heat makes water evaporate.
              </p>
              <div className="space-y-4">
                <div className="bg-surface rounded-2xl p-4 border border-surface-variant/40">
                  <h4 className="font-bold text-error text-sm uppercase tracking-wide mb-1">Night Fungal Risk</h4>
                  <p className="text-sm font-medium">Leaving grass blades wet overnight significantly increases fungal growth and lawn diseases like Dollar Spot and Brown Patch.</p>
                </div>
                <div className="bg-surface rounded-2xl p-4 border border-surface-variant/40">
                  <h4 className="font-bold text-orange-500 text-sm uppercase tracking-wide mb-1">Mid-day Evaporation</h4>
                  <p className="text-sm font-medium">Irrigating at noon loses up to 30% of total volume instantly to the sun.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface-container text-on-surface-variant border-0 rounded-[2rem] shadow-sm overflow-hidden">
            <CardContent className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-secondary/10 rounded-full">
                  <Droplet className="text-secondary" size={24} />
                </div>
                <h3 className="text-xl font-bold text-on-surface font-heading">Why {bestDay.day}?</h3>
              </div>
              <p className="leading-relaxed font-medium text-[15px]">
                <strong>{bestDay.day}</strong> is forecasted to hit <strong>{bestDay.tempHigh}°F</strong> with only <strong>{bestDay.rainChance}% chance of rain</strong> in {cityLabel}. Your lawn will lose the most moisture to heat that day, so a deep dawn soak maximizes root absorption before the soil dries out.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
