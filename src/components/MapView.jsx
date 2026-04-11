import React, { useEffect, useRef, useState } from 'react';
import {
  Viewer, CameraFlyTo, Entity,
  ScreenSpaceEventHandler, ScreenSpaceEvent, ImageryLayer,
} from 'resium';
import {
  Cartesian3, Color, UrlTemplateImageryProvider,
  Math as CMath, ScreenSpaceEventType,
  BoundingSphere, HeadingPitchRange,
  EllipsoidTerrainProvider,
  Ion,
} from 'cesium';

// ── Cesium Ion access token ──
Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjZWRiZThkMi01YmE4LTRiMDQtODNkZC0zOWQ3ZjdjZjIxMTQiLCJpZCI6NDE2ODI5LCJpYXQiOjE3NzU5MTgxNzh9.GH4JPQFQS4NmmbKnLJRKRW_y0hochukwSQ_xjf0G_oc';

// ── OSM Street Tiles ──
const osmProvider = new UrlTemplateImageryProvider({
  url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  subdomains: ['a', 'b', 'c'],
  maximumLevel: 19,
  credit: '© OpenStreetMap contributors',
});

// ── Parkway West High School ──
const SCHOOL_LNG = -90.5347;
const SCHOOL_LAT =  38.6228;

const MapView = ({
  userLocation,
  items = [],
  schoolBoundary,
  onItemSelect,
  onMapClick,
  enable3D = false,
  activeRoute = null,
}) => {
  const viewerRef = useRef(null);
  const routeEntityIdsRef = useRef([]);
  const [tileset3D, setTileset3D] = useState(null);
  const tilesetLoadedRef = useRef(false);

  // Resolve school centre
  const centerLng = schoolBoundary?.center?.[0] ?? SCHOOL_LNG;
  const centerLat = schoolBoundary?.center?.[1] ?? SCHOOL_LAT;
  const radius    = schoolBoundary?.radius       ?? 400;

  // ─────────────────────────────────────────────────────────────────
  // CAMERA SETTINGS
  // ─────────────────────────────────────────────────────────────────
  const camAlt   = 1750;      // 1750m = zoomed out a tiny bit more
  const camPitch = -90;       // -90 = straight down (perfectly matching starting position, no weird angle)
  const camHeading = 0;
  // Position camera perfectly identically for both modes
  const camLat = centerLat;
  const startPos = Cartesian3.fromDegrees(centerLng, camLat, camAlt);

  // ── Load / unload Photorealistic 3D Tiles and Terrain based on mode ──
  useEffect(() => {
    const viewer = viewerRef.current?.cesiumElement;
    if (!viewer || viewer.isDestroyed()) return;

    if (!enable3D) {
      if (tileset3D) {
        try { viewer.scene.primitives.remove(tileset3D); } catch (_) {}
        setTileset3D(null);
        tilesetLoadedRef.current = false;
      }
      
      // Reset to flat terrain for street mode
      viewer.terrainProvider = new EllipsoidTerrainProvider();
      
      // Fly camera to street position
      viewer.camera.flyTo({
        destination: Cartesian3.fromDegrees(centerLng, centerLat, camAlt),
        orientation: {
          heading: CMath.toRadians(camHeading),
          pitch:   CMath.toRadians(-90),
          roll:    0,
        },
        duration: 1.8,
      });
      return;
    }

    if (tilesetLoadedRef.current) return;
    tilesetLoadedRef.current = true;

    // Load Cesium World Terrain for true 3D
    import('cesium').then(({ createWorldTerrainAsync }) => {
      createWorldTerrainAsync()
        .then(terrain => {
          if (viewer && !viewer.isDestroyed()) {
            viewer.terrainProvider = terrain;
          }
        })
        .catch(err => console.warn('World Terrain failed:', err));
    });

    // Add Photorealistic 3D Tiles
    import('cesium').then(({ createGooglePhotorealistic3DTileset }) => {
      createGooglePhotorealistic3DTileset()
        .then(tileset => {
          if (viewer && !viewer.isDestroyed()) {
            viewer.scene.primitives.add(tileset);
            setTileset3D(tileset);
          }
        })
        .catch(err => {
          console.warn('Tileset failed:', err);
          tilesetLoadedRef.current = false;
        });
    });

    // Fly camera to 3D position
    viewer.camera.flyTo({
      destination: Cartesian3.fromDegrees(centerLng, centerLat, camAlt),
      orientation: {
        heading: CMath.toRadians(camHeading),
        pitch:   CMath.toRadians(camPitch),
        roll:    0,
      },
      duration: 1.8,
    });

  }, [enable3D]);

  // ── Route drawing / clearing ──
  useEffect(() => {
    const viewer = viewerRef.current?.cesiumElement;
    if (!viewer || viewer.isDestroyed()) return;

    routeEntityIdsRef.current.forEach(id => {
      const e = viewer.entities.getById(id);
      if (e) viewer.entities.remove(e);
    });
    routeEntityIdsRef.current = [];

    if (!activeRoute || !Array.isArray(activeRoute) || activeRoute.length < 2) return;

    const flat = [];
    activeRoute.forEach(([lng, lat]) => flat.push(lng, lat));
    const positions = Cartesian3.fromDegreesArray(flat);

    viewer.entities.add({
      id: '_route_line',
      polyline: { positions, width: 6, material: Color.fromCssColorString('#3B82F6'), clampToGround: true },
    });
    viewer.entities.add({
      id: '_route_start',
      position: positions[0],
      point: { pixelSize: 16, color: Color.fromCssColorString('#3B82F6'), outlineColor: Color.WHITE, outlineWidth: 3 },
    });
    viewer.entities.add({
      id: '_route_end',
      position: positions[positions.length - 1],
      point: { pixelSize: 16, color: Color.fromCssColorString('#EF4444'), outlineColor: Color.WHITE, outlineWidth: 3 },
    });
    routeEntityIdsRef.current = ['_route_line', '_route_start', '_route_end'];

    viewer.camera.flyToBoundingSphere(
      BoundingSphere.fromPoints(positions),
      { duration: 2, offset: new HeadingPitchRange(0, CMath.toRadians(-50), 0) }
    );

    return () => {
      routeEntityIdsRef.current.forEach(id => {
        const e = viewer?.entities?.getById(id);
        if (e) viewer.entities.remove(e);
      });
      routeEntityIdsRef.current = [];
    };
  }, [activeRoute]);

  const handleMapClick = (e) => {
    if (!onMapClick) return;
    const viewer = viewerRef.current?.cesiumElement;
    if (!viewer || viewer.isDestroyed()) return;
    const cart = viewer.camera.pickEllipsoid(e.position, viewer.scene.globe.ellipsoid);
    if (!cart) return;
    const carto = viewer.scene.globe.ellipsoid.cartesianToCartographic(cart);
    onMapClick([CMath.toDegrees(carto.latitude), CMath.toDegrees(carto.longitude)]);
  };

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      <Viewer
        ref={viewerRef}
        full
        animation={false}
        timeline={false}
        geocoder={false}
        homeButton={false}
        infoBox={false}
        sceneModePicker={false}
        navigationHelpButton={false}
        baseLayerPicker={false}
        fullscreenButton={false}
        selectionIndicator={false}
        scene3DOnly={true}
        msaaSamples={enable3D ? 4 : 2}
        shadows={enable3D}
      >
        {/* Default OSM imagery (only shows when 3D tileset is absent) */}
        {!enable3D && <ImageryLayer imageryProvider={osmProvider} />}

        {/* Initial camera fly-in */}
        <CameraFlyTo
          destination={startPos}
          duration={2.5}
          orientation={{
            heading: CMath.toRadians(camHeading),
            pitch:   CMath.toRadians(camPitch),
            roll:    0,
          }}
          once
        />

        {/* Click handler */}
        <ScreenSpaceEventHandler>
          <ScreenSpaceEvent action={handleMapClick} type={ScreenSpaceEventType.LEFT_CLICK} />
        </ScreenSpaceEventHandler>

        {/* User dot */}
        {Array.isArray(userLocation) && userLocation.length >= 2 && (
          <Entity
            position={Cartesian3.fromDegrees(userLocation[1], userLocation[0])}
            point={{
              pixelSize: 14,
              color: Color.fromCssColorString('#3B82F6'),
              outlineColor: Color.WHITE,
              outlineWidth: 3,
            }}
          />
        )}

        {/* School boundary ring */}
        <Entity
          position={Cartesian3.fromDegrees(centerLng, centerLat)}
          ellipse={{
            semiMajorAxis: radius,
            semiMinorAxis: radius,
            material: Color.fromCssColorString('#3B82F6').withAlpha(0.10),
            outline: true,
            outlineColor: Color.fromCssColorString('#3B82F6').withAlpha(0.80),
            outlineWidth: 3,
            height: 0,
          }}
        />

        {/* Item markers */}
        {items.map((item) => {
          if (!Array.isArray(item.coords) || item.coords.length < 2) return null;
          const isRouting = activeRoute?.id === item.id;
          return (
            <Entity
              key={item.id}
              position={Cartesian3.fromDegrees(item.coords[1], item.coords[0], enable3D ? 10 : 5)}
              onClick={() => onItemSelect && onItemSelect(item)}
              billboard={{
                image: markerSvg(item.type, isRouting),
                scale: isRouting ? 1.2 : 0.8,
                verticalOrigin: 1,
                heightReference: enable3D ? 1 : 0,
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
              }}
            />
          );
        })}
      </Viewer>
    </div>
  );
};

const markerSvg = (type, isRouting) => {
  const fill   = type === 'lost' ? '#EF4444' : '#10B981';
  const stroke = isRouting ? '#FBBF24' : 'white';
  const sw     = isRouting ? 3 : 2;
  return (
    'data:image/svg+xml;charset=utf-8,' +
    encodeURIComponent(
      `<svg width="48" height="56" viewBox="-4 -4 48 56" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 0C8.954 0 0 8.954 0 20 0 35 20 48 20 48S40 35 40 20C40 8.954 31.046 0 20 0Z"
              fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>
        <circle cx="20" cy="20" r="7" fill="white"/>
      </svg>`
    )
  );
};

export default MapView;
