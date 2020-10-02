import React, { useEffect, useRef, useState, useCallback } from 'react';
import leaflet from 'leaflet';

import * as Q from 'src/types/graphql';

type LeafletMapProps = {
  stores: Q.Stores['nodes'];
};

const MAX_MARKER_COUNT = 20;

export const LeafletMap: React.FC<LeafletMapProps> = ({ stores }) => {
  const mapRef = useRef<leaflet.Map>();
  const centerRef = useRef<leaflet.Marker>();
  const markersRef = useRef<
    {
      dist: number;
      marker: leaflet.Marker;
    }[]
  >([]);
  const [didMount, setDidMount] = useState(false);

  const AddMarker = useCallback(
    ({ stores }: Pick<LeafletMapProps, 'stores'>) => {
      const map = mapRef.current;
      const markers = markersRef.current;
      if (!map || !markers) {
        return;
      }

      const pinIcon = leaflet.icon({
        iconUrl: '/static/images/pin.png',
        iconSize: [40, 40],
      });

      const bounds = map.getBounds();
      const east = bounds.getEast();
      const west = bounds.getWest();
      const south = bounds.getSouth();
      const north = bounds.getNorth();
      const center = bounds.getCenter();

      // 一時削除 TODO: fix
      markers.forEach((marker) => {
        map.removeLayer(marker.marker);
      });
      markers.length = 0;

      stores.forEach((store) => {
        const location = store?.location;
        if (
          typeof location?.lat !== 'number' ||
          typeof location?.lng !== 'number'
        ) {
          return;
        }

        const inLocation = includeLocation(
          {
            lat: location.lat,
            lng: location.lng,
          },
          {
            east,
            west,
            south,
            north,
          }
        );

        // 画面内にマーカーが入っていない
        if (!inLocation) {
          return;
        }

        const storeDist = Math.sqrt(
          (center.lat - location.lat) ** 2 + (center.lng - location.lng) ** 2
        );

        // 挿入箇所を探す
        let insertIdx = -1;
        if ((markers[0]?.dist || Infinity) > storeDist) {
          const idx = markers.findIndex((marker) => {
            return marker.dist < storeDist;
          });
          // 一番遠い店より近くでかつindexが見つからないときは、距離が一番ちかいとき
          insertIdx = idx >= 0 ? idx : markers.length;
        }

        // marker上限に達してないとき
        if (markers.length < MAX_MARKER_COUNT) {
          const marker = leaflet
            .marker([location.lat, location.lng], {
              icon: pinIcon,
            })
            .addTo(map)
            .bindPopup(
              `${store?.name}<br>${store?.id}<br>(${location.lat},${location.lng})<br><a href="https://www.google.com/search?q=${store?.name} ${store?.address}" target="_blank">Googleで検索</a>`
            );

          markers.splice(Math.max(insertIdx, 0), 0, {
            dist: storeDist,
            marker,
          });

          return;
        }

        // 挿入箇所がある
        if (insertIdx >= 0) {
          const marker = leaflet
            .marker([location.lat, location.lng], {
              icon: pinIcon,
            })
            .addTo(map)
            .bindPopup(
              `${store?.name}
              <br>
              ${store?.category}
              <br>
              <a href="https://www.google.com/search?q=${store?.name} ${store?.address}" target="_blank">Googleで検索</a>`
            );

          // marker追加
          markers.splice(Math.max(insertIdx, 0), 0, {
            dist: storeDist,
            marker,
          });

          // head marker削除
          const headMarker = markers.shift();
          if (headMarker) {
            map.removeLayer(headMarker.marker);
          }
        }
      });
    },
    []
  );

  /**
   * init Leaflet
   */
  useEffect(() => {
    // for nextjs's hot reload
    if (mapRef.current) {
      return;
    }

    const map = leaflet
      .map('map', {
        preferCanvas: true,
      })
      .setView([35.651737, 139.5438499], 18);

    leaflet
      .tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      })
      .addTo(map);

    const centerIcon = leaflet.icon({
      iconUrl: '/static/images/center.png',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    centerRef.current = leaflet
      .marker(map.getCenter(), {
        icon: centerIcon,
        zIndexOffset: 1000,
        interactive: false,
      })
      .addTo(map);

    mapRef.current = map;

    setDidMount(true);
  }, []);

  /**
   * reaflet event
   */
  useEffect(() => {
    const map = mapRef.current;
    const marker = markersRef.current;
    if (!map || !stores.length) {
      return;
    }

    // first adding marker
    if (didMount && marker.length === 0) {
      AddMarker({ stores });
    }

    map.addEventListener('dragend', () => {
      AddMarker({ stores });
    });

    map.on('move', () => {
      const center = centerRef.current;
      if (center) {
        center.setLatLng(map.getCenter());
      }
    });

    map.addEventListener('zoom', () => {
      AddMarker({ stores });
    });

    return () => {
      map.removeEventListener('dragend');
      map.removeEventListener('move');
      map.removeEventListener('zoom');
    };
  }, [didMount, stores]);

  return (
    <>
      <div id="map" />
    </>
  );
};

export function includeLocation(
  location: {
    lat: number;
    lng: number;
  },
  corner: {
    east: number;
    west: number;
    south: number;
    north: number;
  }
) {
  const { east, west, south, north } = corner;
  const { lat, lng } = location;

  const inLng = west < lng && lng < east;
  const inLat = north > lat && lat > south;

  return inLat && inLng;
}

export default LeafletMap;
