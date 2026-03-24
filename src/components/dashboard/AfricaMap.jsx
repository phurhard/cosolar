import React, { useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Country center coordinates
const countryCoords = {
  'Nigeria': [9.082, 8.675],
  'Ghana': [7.946, -1.023],
  'Kenya': [-0.024, 37.906],
  'South Africa': [-30.559, 22.937],
  'Egypt': [26.821, 30.802],
  'Morocco': [31.792, -7.092],
  'Tanzania': [-6.369, 34.889],
  'Ethiopia': [9.145, 40.490],
  'Rwanda': [-1.940, 29.874],
  'Uganda': [1.373, 32.290],
  'Senegal': [14.497, -14.452],
  'Cameroon': [7.370, 12.354],
  'Ivory Coast': [7.540, -5.547],
  'Other': [0, 20]
};

function MapBounds({ installations }) {
  const map = useMap();
  
  React.useEffect(() => {
    if (installations.length > 0) {
      map.setView([5, 20], 3);
    }
  }, [installations, map]);

  return null;
}

export default function AfricaMap({ installations }) {
  // Aggregate by country
  const countryData = useMemo(() => {
    const data = {};
    installations.forEach(inst => {
      const country = inst.country || 'Other';
      if (!data[country]) {
        data[country] = { count: 0, kva: 0, panels: 0 };
      }
      data[country].count += 1;
      data[country].kva += inst.system_size_kva || 0;
      data[country].panels += inst.number_of_panels || 0;
    });
    return data;
  }, [installations]);

  const maxKva = Math.max(...Object.values(countryData).map(d => d.kva), 1);

  return (
    <div className="h-[500px] rounded-2xl overflow-hidden border border-border">
      <MapContainer
        center={[5, 20]}
        zoom={3}
        className="h-full w-full"
        style={{ background: 'hsl(var(--card))' }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <MapBounds installations={installations} />
        
        {Object.entries(countryData).map(([country, data]) => {
          const coords = countryCoords[country];
          if (!coords) return null;
          
          const radius = Math.max(10, (data.kva / maxKva) * 40);
          
          return (
            <CircleMarker
              key={country}
              center={coords}
              radius={radius}
              pathOptions={{
                fillColor: 'hsl(38, 92%, 50%)',
                fillOpacity: 0.6,
                color: 'hsl(38, 92%, 60%)',
                weight: 2,
              }}
            >
              <Popup>
                <div className="text-sm">
                  <div className="font-bold text-lg">{country}</div>
                  <div className="mt-2 space-y-1">
                    <div><span className="text-muted-foreground">Installations:</span> {data.count}</div>
                    <div><span className="text-muted-foreground">Total kVA:</span> {data.kva.toLocaleString()}</div>
                    <div><span className="text-muted-foreground">Panels:</span> {data.panels.toLocaleString()}</div>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}