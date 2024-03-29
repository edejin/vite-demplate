import {GeoJSONSource, Map} from 'mapbox-gl';
import {FeatureCollection, Geometry} from 'geojson';
import {toDegreesMinutesSeconds} from 'dgeoutils/dist/cjs/utils';
import {waitForStyles} from '@/utils/map';
import {useMapStore} from '@/store/map';
import Grid from '@/assets/icons/grid.svg';

export const addGrid = (map?: Map) => {
  if (!map) {
    return;
  }

  const graticule: FeatureCollection<Geometry> = {
    type: 'FeatureCollection',
    features: []
  };

  if (useMapStore.getState().showGrid) {
    const bounds = map.getBounds();
    const s = bounds.getSouth();
    const w = bounds.getWest();
    const e = bounds.getEast();
    const n = bounds.getNorth();
    const step = 2 ** Math.ceil(Math.log2(Math.min(Math.abs(s - n) / 4, Math.abs(w - e) / 4)));

    for (let lng = -180; lng <= 180; lng += step) {
      if (lng >= w && lng <= e) {
        graticule.features.push({
          type: 'Feature',
          geometry: {type: 'LineString', coordinates: [[lng, s], [lng, n]]},
          properties: {
            value: lng,
            caption: toDegreesMinutesSeconds(lng)
          }
        });
      }
    }
    for (let lat = -90; lat <= 90; lat += step) {
      if (lat >= s && lat <= n) {
        graticule.features.push({
          type: 'Feature',
          geometry: {type: 'LineString', coordinates: [[w, lat], [e, lat]]},
          properties: {
            value: lat,
            caption: toDegreesMinutesSeconds(lat)
          }
        });
      }
    }
  }

  if (map?.getSource('graticule')) {
    (map?.getSource('graticule') as GeoJSONSource).setData(graticule);
    return;
  }

  map.addSource('graticule', {
    type: 'geojson',
    data: graticule
  });
  map.addLayer({
    id: 'graticule-outer',
    type: 'line',
    source: 'graticule',
    layout: {
      visibility: "visible"
    },
    paint: {
      "line-width": 2,
      "line-color": "rgb(255,255,255)"
    }
  });
  map.addLayer({
    id: 'graticule',
    type: 'line',
    source: 'graticule',
    layout: {
      visibility: "visible"
    },
    paint: {
      "line-width": 1,
      "line-color": "rgb(0,0,0)"
    }
  });
  map.addLayer({
    id: 'graticule-caption',
    type: 'symbol',
    source: 'graticule',
    layout: {
      'text-font': [
        'Roboto Regular'
      ],
      'text-size': 10,
      'text-field': '{caption}',
      'text-transform': 'none',
      'text-rotation-alignment': 'map',
      'symbol-placement': 'line'
    },
    'paint': {
      'text-color': '#000000',
      "text-opacity": 1,
      "text-opacity-transition": {
        "duration": 0
      },
      'text-halo-color': "#ffffff",
      'text-halo-width': 2
    }
  });
};

export class MapGrid {
  private unsubscribe: () => void;

  onAdd(map: Map) {
    ;(0, async () => {
      await waitForStyles(map);
      addGrid(map);
      const moveHandler = () => {
        addGrid(map);
      };
      map.on('move', moveHandler);

      this.unsubscribe = () => {
        map.off('move', moveHandler);
      };
    })();
    const div = document.createElement("div");
    div.className = "mapboxgl-ctrl mapboxgl-ctrl-group";
    div.innerHTML = `<button>
        <img src="${Grid}" alt="">
        </button>`;
    div.addEventListener("click", () => {
      const {showGrid, setShowGrid} = useMapStore.getState();
      setShowGrid(!showGrid);
      addGrid(map);
    });
    this.unsubscribe = useMapStore.subscribe(() => {
      div.innerHTML = `<button>
        <img src="${Grid}" alt="">
        </button>`;
    });

    return div;
  }

  onRemove() {
    this.unsubscribe();
  }
}
