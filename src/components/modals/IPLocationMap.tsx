'use client'

import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import { LatLngBoundsExpression, LatLngExpression } from 'leaflet';
import { PlusIcon, MinusIcon } from "@heroicons/react/24/outline";
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/marker.png',
  iconUrl: '/marker.png',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -38],
  shadowUrl: undefined,
});

const CustomZoomControls = () => {
  const map = useMap();

  const stopPropagation = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      className="absolute top-4 right-4 z-[1000] flex flex-col gap-2"
      onMouseDown={stopPropagation}
      onTouchStart={stopPropagation}
    >
      <button
        onClick={() => map.zoomIn()}
        className="w-10 h-10 flex justify-center items-center bg-black/50 hover:cursor-pointer border-1 border-gray-700/50 hover:border-gray-500/50 hover:scale-110 rounded-full text-xl text-white backdrop-blur-2xl transition-all duration-100"
      >
        <PlusIcon className='w-5 h-5' />
      </button>
      <button
        onClick={() => map.zoomOut()}
        className="w-10 h-10 flex justify-center items-center bg-black/50 hover:cursor-pointer border-1 border-gray-700/50 hover:border-gray-500/50 hover:scale-110 rounded-full text-xl text-white backdrop-blur-2xl transition-all duration-100"
      >
        <MinusIcon className='w-5 h-5' />
      </button>
    </div>
  );
};

interface IPLocationMapProps {
  location: any;
  label: string;
  isKorean: boolean;
  vworldKey: string | undefined;
}

const IPLocationMap: React.FC<IPLocationMapProps> = ({ location, label, isKorean, vworldKey }) => {
  const position: LatLngExpression = [location?.latitude, location?.longitude];

  const koreaBounds: LatLngBoundsExpression = [
    [31, 120.7],
    [44, 135],
  ];

  return (
    <MapContainer
      center={position}
      zoom={12}
      maxZoom={18}
      minZoom={7}
      scrollWheelZoom={true}
      zoomControl={false}
      doubleClickZoom={false}
      attributionControl={false}
      className="h-full w-full !bg-background"
      maxBounds={isKorean ? koreaBounds : undefined}
      maxBoundsViscosity={isKorean ? 0.7 : 0}
    >
      <TileLayer
        attribution={isKorean ? '© VWorld' : '© OpenStreetMap contributors'}
        url={
          isKorean
            ? `https://api.vworld.kr/req/wmts/1.0.0/${vworldKey}/midnight/{z}/{y}/{x}.png`
            : 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}@2x.png'
        }
      />

      <Marker position={position}>
        <Popup>{label ?? '여기입니다!'}</Popup>
      </Marker>

      {/* 오차 반경 원 */}
      <Circle
        center={position}
        radius={6000}
        pathOptions={{
          color: '#ff03',
          fillColor: '#ff0',
          fillOpacity: 0.09,
          weight: 1.5,
        }}
      />

      <CustomZoomControls />
    </MapContainer>
  );
};

export default IPLocationMap;
