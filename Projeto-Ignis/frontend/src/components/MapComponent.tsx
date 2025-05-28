import * as L from 'leaflet';
import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import type { FeatureCollection } from 'geojson';
import type { MarkerCluster } from 'leaflet';

interface BaseDado {
  latitude: number;
  longitude: number;
  estado: string;
  bioma: string;
  risco_fogo: number;
  data: string;
  frp?: number;
  dia_sem_chuva?: string;
  precipitacao?: number;
  tipo: 'risco' | 'foco' | 'area_queimada';
}

interface Props {
  dados: BaseDado[];
  filtros: {
    bioma: string;
  };
  tipo: '' | 'risco' | 'foco_calor' | 'area_queimada';
}

const brasilBounds: L.LatLngBoundsExpression = [
  [-34.0, -74.0],
  [5.3, -32.4],
];

const getColor = (valor: number): string => {
  if (valor >= 0.8) return '#800026';
  if (valor >= 0.6) return '#BD0026';
  if (valor >= 0.4) return '#FC4E2A';
  if (valor >= 0.2) return '#FD8D3C';
  if (valor > 0) return '#FED976';
  return '#FFEDA0';
};

const centroEstados: Record<string, { lat: number; lon: number }> = {
  'Acre': { lat: -9.02, lon: -70.81 },
  'Alagoas': { lat: -9.57, lon: -36.78 },
  'Amapá': { lat: 1.41, lon: -51.77 },
  'Amazonas': { lat: -3.47, lon: -65.10 },
  'Bahia': { lat: -12.96, lon: -41.55 },
  'Ceará': { lat: -5.20, lon: -39.50 },
  'Distrito Federal': { lat: -15.83, lon: -47.86 },
  'Espírito Santo': { lat: -19.19, lon: -40.34 },
  'Goiás': { lat: -15.98, lon: -49.86 },
  'Maranhão': { lat: -5.42, lon: -45.44 },
  'Mato Grosso': { lat: -12.64, lon: -55.42 },
  'Mato Grosso do Sul': { lat: -20.51, lon: -54.54 },
  'Minas Gerais': { lat: -18.10, lon: -44.38 },
  'Pará': { lat: -3.79, lon: -52.48 },
  'Paraíba': { lat: -7.12, lon: -36.72 },
  'Paraná': { lat: -24.89, lon: -51.55 },
  'Pernambuco': { lat: -8.38, lon: -37.86 },
  'Piauí': { lat: -7.72, lon: -43.00 },
  'Rio de Janeiro': { lat: -22.84, lon: -43.15 },
  'Rio Grande do Norte': { lat: -5.81, lon: -36.59 },
  'Rio Grande do Sul': { lat: -30.01, lon: -53.43 },
  'Rondônia': { lat: -10.90, lon: -62.80 },
  'Roraima': { lat: 2.05, lon: -61.39 },
  'Santa Catarina': { lat: -27.45, lon: -50.95 },
  'São Paulo': { lat: -23.55, lon: -46.64 },
  'Sergipe': { lat: -10.57, lon: -37.45 },
  'Tocantins': { lat: -10.25, lon: -48.25 }
};

const normalizar = (str: string) =>
  str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const MapComponent: React.FC<Props> = ({ dados, filtros, tipo }) => {
  const [geojsonBiomas, setGeojsonBiomas] = useState<FeatureCollection | null>(null);

  useEffect(() => {
    fetch('/biomas.geojson')
      .then(res => res.json())
      .then(data => setGeojsonBiomas(data))
      .catch(err => console.error('❌ Erro ao carregar biomas:', err));
  }, []);

  const biomaIdToNome: Record<number, string> = {
    1: 'Amazônia',
    2: 'Caatinga',
    3: 'Cerrado',
    4: 'Mata Atlântica',
    5: 'Pampa',
    6: 'Pantanal',
  };

  const contornoFiltrado = useMemo(() => {
    if (!geojsonBiomas || !filtros.bioma) return null;

    const nomeBioma = biomaIdToNome[Number(filtros.bioma)];
    if (!nomeBioma) return null;

    const filtrados = geojsonBiomas.features.filter((f: any) => {
      const nomeFeature = f.properties?.bioma;
      if (!nomeFeature) return false;
      return normalizar(nomeFeature) === normalizar(nomeBioma);
    });

    return {
      ...geojsonBiomas,
      features: filtrados
    };
  }, [geojsonBiomas, filtros.bioma]);

  const dadosRiscoPorEstado = useMemo(() => {
    if (tipo !== 'risco') return [];

    const agrupado = dados.reduce<Record<string, { total: number; count: number }>>(
      (acc, item) => {
        if (item.risco_fogo < 0) return acc;
        const chave = item.estado;
        if (!acc[chave]) {
          acc[chave] = {
            total: 0,
            count: 0
          };
        }
        acc[chave].total += item.risco_fogo;
        acc[chave].count += 1;
        return acc;
      },
      {}
    );

    return Object.entries(agrupado).map(([estado, { total, count }]) => ({
      estado,
      media: total / count,
      latitude: centroEstados[estado]?.lat ?? -15.78,
      longitude: centroEstados[estado]?.lon ?? -47.92
    }));
  }, [dados, tipo]);

  const markers = useMemo(() =>
    dados.map((item, idx) => (
      <Marker
        key={idx}
        position={[item.latitude, item.longitude]}
        icon={L.divIcon({
          className: 'custom-icon',
          html: `<div style="background-color: ${getColor(item.risco_fogo)}; width: 20px; height: 20px; border-radius: 50%;"></div>`
        })}
      >
        <Popup>
          <strong>Data:</strong> {new Date(item.data).toLocaleDateString()}<br />
          <strong>Estado:</strong> {item.estado}<br />
          <strong>Bioma:</strong> {item.bioma}<br />
          <strong>Risco de Fogo:</strong> {item.risco_fogo}<br />
          {item.frp !== undefined && <><strong>FRP:</strong> {item.frp}<br /></>}
          {item.dia_sem_chuva && (
            <>
              <strong>Dias sem chuva:</strong> {item.dia_sem_chuva}<br />
              <strong>Precipitação:</strong> {item.precipitacao}<br />
            </>
          )}
        </Popup>
      </Marker>
    )), [dados]);

  return (
    <MapContainer
      center={[-15.78, -47.92]}
      zoom={4}
      style={{ height: '100vh', width: '100%' }}
      maxBounds={brasilBounds}
      maxBoundsViscosity={1.0}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />

      {tipo === 'risco' && dadosRiscoPorEstado.map((item, idx) => (
        <Marker
          key={idx}
          position={[item.latitude, item.longitude]}
          icon={L.divIcon({
            className: 'custom-icon',
            html: `<div style="background-color: ${getColor(item.media)}; width: 35px; height: 35px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">${item.media.toFixed(2)}</div>`
          })}
        >
          <Popup>
            <strong>Estado:</strong> {item.estado}<br />
            <strong>Média Risco de Fogo:</strong> {item.media.toFixed(2)}
          </Popup>
        </Marker>
      ))}

      {(tipo === 'foco_calor' || tipo === 'area_queimada') && (
        <MarkerClusterGroup
          iconCreateFunction={(cluster: MarkerCluster) => {
            const count = cluster.getChildCount();
            let color = "#FEB24C";
            if (count >= 100) color = "#800026";
            else if (count >= 50) color = "#BD0026";
            else if (count >= 20) color = "#FC4E2A";
            else if (count >= 10) color = "#FD8D3C";

            return L.divIcon({
              html: `<div style="background-color: ${color}; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">${count}</div>`,
              className: 'marker-cluster-custom',
              iconSize: L.point(40, 40, true)
            });
          }}
        >
          {markers}
        </MarkerClusterGroup>
      )}

      {contornoFiltrado && (
        <GeoJSON
          key={filtros.bioma}
          data={contornoFiltrado}
          style={() => ({
            color: 'black',
            weight: 3,
            fillOpacity: 0
          })}
        />
      )}

      <Legenda />
    </MapContainer>
  );
};

export default MapComponent;

// 🔥 Legenda
const Legenda = () => {
  const map = useMap();

  useEffect(() => {
    const legenda = (L.control as unknown as (options?: L.ControlOptions) => L.Control)({ position: 'bottomright' });

    legenda.onAdd = () => {
      const div = L.DomUtil.create('div', 'info legend');
      const grades = [0, 0.2, 0.4, 0.6, 0.8, 1];
      const labels = grades.map(g => `
        <i style="background:${getColor(g)}"></i> ${g}
      `);

      div.innerHTML = `
        <h4>Risco de Fogo</h4>
        ${labels.join('<br>')}
      `;
      return div;
    };

    legenda.addTo(map);
    return () => {
      legenda.remove();
    };
  }, [map]);

  return null;
};
