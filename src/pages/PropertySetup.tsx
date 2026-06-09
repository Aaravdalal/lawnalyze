import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { MapPin, Edit3, Building2 } from 'lucide-react';

import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export function PropertySetup() {
  const { properties, activePropertyId, setOnboardingStep } = useStore();
  const property = properties.find(p => p.id === activePropertyId);
  const location = property?.location;
  const lawnAreaSqFt = property?.lawns.reduce((sum, lawn) => sum + lawn.areaSqFt, 0) || 0;

  const boundaryGeoJSON = property && property.lawns.length > 0 
    ? {
        type: "FeatureCollection",
        features: property.lawns.map(l => l.boundaryGeoJSON).filter(Boolean)
      } 
    : null;

  const handleEditAddress = () => {
    setOnboardingStep('address');
  };

  const handleEditLawn = () => {
    setOnboardingStep('map');
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-8"
      >
        <header className="flex flex-col gap-2">
          <h1 className="text-4xl font-black font-heading tracking-tight text-on-surface">
            Property Setup
          </h1>
          <p className="text-on-surface-variant text-lg">
            Manage your property details and lawn configuration.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Property Card */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <motion.div 
              whileHover={{ y: -4 }}
              className="bg-surface-container rounded-[2.5rem] p-8 shadow-sm border border-surface-variant/20 relative overflow-hidden group"
            >
              {/* Background Glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 group-hover:bg-primary/10 transition-colors" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                      <Building2 size={28} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold font-heading">Lawn Overview</h2>
                      <p className="text-on-surface-variant text-sm">Primary Residence</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={handleEditAddress}
                      className="p-3 bg-secondary/10 hover:bg-secondary/20 text-secondary rounded-xl transition-colors title='Change Address'"
                    >
                      <MapPin size={20} />
                    </button>
                    <button 
                      onClick={handleEditLawn}
                      className="p-3 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl transition-colors title='Redraw Lawn'"
                    >
                      <Edit3 size={20} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Address Section */}
                  <div className="bg-surface-container-low rounded-3xl p-6 border border-surface-variant/10">
                    <p className="text-xs font-bold text-on-surface-variant/60 uppercase tracking-widest mb-3">Service Address</p>
                    <p className="text-lg font-bold leading-tight mb-1">{location?.address || 'No address set'}</p>
                    <p className="text-on-surface-variant">{location?.city}, {location?.state}</p>
                  </div>

                  {/* Size Section */}
                  <div className="bg-surface-container-low rounded-3xl p-6 border border-surface-variant/10">
                    <p className="text-xs font-bold text-on-surface-variant/60 uppercase tracking-widest mb-3">Lawn Size</p>
                    <div className="flex items-end gap-2">
                      <p className="text-4xl font-black text-primary font-heading leading-none">
                        {lawnAreaSqFt.toLocaleString()}
                      </p>
                      <p className="text-lg font-bold text-on-surface-variant mb-0.5">sq ft</p>
                    </div>
                  </div>
                </div>

                {/* Quick Info (Removed Est. Weekly Need per request) */}
              </div>
            </motion.div>

            {/* Redraw Option Prompt */}
            <div className="bg-primary/5 rounded-[2rem] p-8 border border-primary/10 flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">Want a more precise scan?</h3>
                <p className="text-on-surface-variant">You can redraw your lawn boundaries at any time using our satellite engine.</p>
              </div>
              <button 
                onClick={handleEditLawn}
                className="px-6 py-3 bg-primary text-white font-bold rounded-2xl hover:bg-primary/90 transition-all hover:scale-105 active:scale-95"
              >
                Redraw Lawn
              </button>
            </div>
          </div>

          {/* Sidebar Info/Tips */}
          <div className="flex flex-col gap-6">
            <div className="bg-surface-container rounded-[2rem] p-4 shadow-sm border border-surface-variant/20">
              <div className="flex items-center justify-between mb-4 px-2 pt-2">
                 <h3 className="font-bold flex items-center gap-2">
                  <MapPin className="text-primary" size={16} />
                  Location
                </h3>
              </div>
              <div className="aspect-[4/3] bg-surface-container-high rounded-2xl overflow-hidden relative group">
                <div className="w-full h-full transition-transform duration-700 group-hover:scale-105 pointer-events-none">
                  <MapContainer
                    center={location?.coords || [37.3861, -122.0839]}
                    zoom={20}
                    zoomControl={false}
                    dragging={false}
                    touchZoom={false}
                    scrollWheelZoom={false}
                    doubleClickZoom={false}
                    style={{ height: '100%', width: '100%', zIndex: 0 }}
                  >
                    <TileLayer
                      url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
                      maxNativeZoom={21} maxZoom={22}
                    />
                    {boundaryGeoJSON && (
                      <GeoJSON 
                        key={JSON.stringify(boundaryGeoJSON)}
                        data={boundaryGeoJSON}
                        style={{ color: '#0b5cff', weight: 4, fillColor: '#0b5cff', fillOpacity: 0.2 }}
                      />
                    )}
                  </MapContainer>
                </div>

                {!boundaryGeoJSON && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <div className="w-16 h-16 rounded-full border-2 border-primary/60 bg-primary/20 animate-pulse flex items-center justify-center backdrop-blur-[1px]">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    </div>
                  </div>
                )}

                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm z-20">
                  <button onClick={handleEditLawn} className="bg-white text-primary px-4 py-2 font-bold rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all pointer-events-auto">
                    Adjust Area
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
