import { contours } from 'd3-contour';
import type * as L from 'leaflet';
import area from '@turf/area';
import { polygon, point } from '@turf/helpers';
import simplify from '@turf/simplify';
import centroid from '@turf/centroid';
import distance from '@turf/distance';

export async function detectLawn(map: L.Map): Promise<any[]> {
  const size = map.getSize();
  const width = size.x;
  const height = size.y;
  
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error("Could not get 2d context");

  // Get all tile images from the Leaflet tile pane
  const container = map.getContainer();
  const tiles = Array.from(container.querySelectorAll('.leaflet-tile-pane img')) as HTMLImageElement[];
  
  if (tiles.length === 0) {
    throw new Error("No map tiles found on screen.");
  }

  // Draw tiles to canvas
  const mapRect = container.getBoundingClientRect();
  
  // We need to wait for tiles to be fully loaded, but usually they are if visible
  for (const img of tiles) {
    const rect = img.getBoundingClientRect();
    const x = rect.left - mapRect.left;
    const y = rect.top - mapRect.top;
    
    try {
      ctx.drawImage(img, x, y, rect.width, rect.height);
    } catch (e) {
      console.warn("Failed to draw tile, might be cross-origin issue", e);
    }
  }

  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const values = new Array(width * height).fill(0);

  // Excess Green Index Thresholding
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // Grass is typically bright and yellowish-green. Trees are dark green.
    // Ignore dark pixels (shadows and dark tree canopies)
    if (r + g + b < 220 || r + g + b > 700) continue;

    const sum = r + g + b;
    const nr = r / sum;
    const ng = g / sum;
    const nb = b / sum;
    
    // ExG formula: 2g - r - b
    const exg = 2 * ng - nr - nb;
    
    // Grass has a higher red component (yellowish green) compared to trees (deep green).
    // Ensure Red is at least 60% of Green.
    const isYellowishGreen = r > g * 0.60;
    
    // Thresholds: ExG > 0.05 usually indicates healthy vegetation
    // We also ensure green is the dominant color to prevent false positives
    if (exg > 0.05 && g > r && g > b && g > 80 && isYellowishGreen) {
      values[i / 4] = 1;
    }
  }

  // Generate contours
  const contourGen = contours()
    .size([width, height])
    .thresholds([0.5]);

  const contourFeatures = contourGen(values);
  
  const generatedLawns: any[] = [];
  const candidates: { distance: number, lawn: any }[] = [];
  
  // We expect a single MultiPolygon feature for the threshold = 0.5
  if (contourFeatures.length > 0) {
    const multiPoly = contourFeatures[0]; // The 0.5 threshold multipolygon
    
    // A MultiPolygon is an array of Polygons. A Polygon is an array of LinearRings
    multiPoly.coordinates.forEach((polyCoords, index) => {
      // Map pixel space back to lat/lng
      const geoPolyCoords = polyCoords.map(ring => {
        return ring.map(point => {
          const [x, y] = point;
          // IMPORTANT: leaflet containerPointToLatLng takes an array [x,y] or Point
          const latlng = map.containerPointToLatLng([x, y] as any);
          return [latlng.lng, latlng.lat];
        });
      });

      try {
        // Turf polygon expects an array of rings
        let p = polygon(geoPolyCoords);
        
        // Simplify geometry drastically to prevent tab crashing (tolerance in degrees: 0.000005 is ~0.5m)
        p = simplify(p, { tolerance: 0.000005, highQuality: true });
        
        const areaSqMeters = area(p);
        const areaSqFt = Math.round(areaSqMeters * 10.7639);
        
        // Filter out tiny noise (e.g. bushes, under 100 sq ft)
        // and ridiculously large areas (e.g. over 50k sq ft could be a forest mapping bug)
        if (areaSqFt > 100 && areaSqFt < 50000) {
          
          // Constrain to ONLY the target house (near the center of the screen)
          const mapCenter = map.getCenter();
          const centerPt = point([mapCenter.lng, mapCenter.lat]);
          const polyCentroid = centroid(p);
          const distMeters = distance(centerPt, polyCentroid, { units: 'meters' });
          
          candidates.push({
            distance: distMeters,
            lawn: {
              id: `auto-${crypto.randomUUID()}`,
              name: `Auto Lawn`,
              areaSqFt,
              boundaryGeoJSON: p
            }
          });
        }
      } catch (e) {
        // Ignore invalid rings (e.g. self-intersecting artifacts)
      }
    });
  }

  // Pick ONLY the single closest lawn to the center of the map, and shrink the max radius to 25 meters (~80 feet)
  candidates.sort((a, b) => a.distance - b.distance);
  if (candidates.length > 0 && candidates[0].distance < 25) {
    generatedLawns.push(candidates[0].lawn);
  }

  return generatedLawns;
}
