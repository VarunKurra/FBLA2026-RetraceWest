import React, { useEffect, useRef, useState } from 'react';
import { Viewer, CameraFlyTo, Entity, ImageryLayer, ScreenSpaceEventHandler, ScreenSpaceEvent } from 'resium';
import { Cartesian3, Color, IonImageryProvider, OpenStreetMapImageryProvider, Math as CMath, ScreenSpaceEventType, BoundingSphere, HeadingPitchRange } from 'cesium';

const osmImagery = new OpenStreetMapImageryProvider({
  url: 'https://a.tile.openstreetmap.org/'
});

const esriSatellite = new IonImageryProvider({ assetId: 2 });

const MapView = ({ userLocation, items = [], schoolBoundary, onItemSelect, onMapClick, mapStyle = 'street', activeRoute = null }) => {
  const viewerRef = useRef(null);
  const [osmBuildings, setOsmBuildings] = useState(null);
  const routeEntityIdsRef = useRef([]);

  const targetPosition = Cartesian3.fromDegrees(
    schoolBoundary.center[1],
    schoolBoundary.center[0] - 0.007,
    1000
  );

  // Load 3D buildings + fix zoom
  useEffect(() => {
    import('cesium').then(({ createOsmBuildingsAsync }) => {
      createOsmBuildingsAsync().then(tileset => {
        setOsmBuildings(tileset);
      }).catch(console.error);
    });

    if (viewerRef.current && viewerRef.current.cesiumElement) {
      const controller = viewerRef.current.cesiumElement.scene.screenSpaceCameraController;
      controller.zoomEventTypes = [ScreenSpaceEventType.WHEEL, ScreenSpaceEventType.PINCH];
      controller.tiltEventTypes = [ScreenSpaceEventType.PINCH, ScreenSpaceEventType.RIGHT_DRAG];
    }
  }, []);

  // Draw route using Cesium viewer API directly (NOT Resium declarative — that doesn't render)
  useEffect(() => {
    const viewer = viewerRef.current?.cesiumElement;
    if (!viewer) return;

    // Clear previous route entities
    routeEntityIdsRef.current.forEach(id => {
      const entity = viewer.entities.getById(id);
      if (entity) viewer.entities.remove(entity);
    });
    routeEntityIdsRef.current = [];

    if (!activeRoute || !Array.isArray(activeRoute) || activeRoute.length < 2) return;

    // OSRM gives [lng, lat] — flatten to [lng, lat, lng, lat, ...]
    const flatCoords = [];
    for (let i = 0; i < activeRoute.length; i++) {
      flatCoords.push(activeRoute[i][0], activeRoute[i][1]);
    }
    const positions = Cartesian3.fromDegreesArray(flatCoords);

    // Route polyline
    viewer.entities.add({
      id: '_route_line',
      polyline: {
        positions: positions,
        width: 6,
        material: Color.fromCssColorString('#4F46E5'),
        clampToGround: true,
      },
    });
    routeEntityIdsRef.current.push('_route_line');

    // Start marker (blue = your position)
    viewer.entities.add({
      id: '_route_start',
      position: positions[0],
      point: { pixelSize: 16, color: Color.fromCssColorString('#3B82F6'), outlineColor: Color.WHITE, outlineWidth: 3 },
    });
    routeEntityIdsRef.current.push('_route_start');

    // End marker (red = item destination)
    viewer.entities.add({
      id: '_route_end',
      position: positions[positions.length - 1],
      point: { pixelSize: 16, color: Color.fromCssColorString('#EF4444'), outlineColor: Color.WHITE, outlineWidth: 3 },
    });
    routeEntityIdsRef.current.push('_route_end');

    // Fly camera to fit route
    viewer.camera.flyToBoundingSphere(
      BoundingSphere.fromPoints(positions),
      { duration: 2, offset: new HeadingPitchRange(0, CMath.toRadians(-50), 0) }
    );

    console.log('Route drawn with', positions.length, 'vertices');

    return () => {
      routeEntityIdsRef.current.forEach(id => {
        const entity = viewer?.entities?.getById(id);
        if (entity) viewer.entities.remove(entity);
      });
      routeEntityIdsRef.current = [];
    };
  }, [activeRoute]);

  const handlePointClick = (item) => {
    if (onItemSelect) onItemSelect(item);
  };

  return (
    <div className="map-view-v5" style={{ height: '100%', width: '100%', position: 'relative' }}>
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
        msaaSamples={1}
      >
        {mapStyle === 'street' && <ImageryLayer imageryProvider={osmImagery} />}
        {mapStyle === 'satellite' && <ImageryLayer imageryProvider={esriSatellite} />}

        {osmBuildings && mapStyle === 'street' && (
          <primitive object={osmBuildings} />
        )}

        <ScreenSpaceEventHandler>
          <ScreenSpaceEvent
            action={(e) => {
              if (onMapClick && viewerRef.current && viewerRef.current.cesiumElement) {
                const viewer = viewerRef.current.cesiumElement;
                const cartesian = viewer.camera.pickEllipsoid(e.position, viewer.scene.globe.ellipsoid);
                if (cartesian) {
                  const cartographic = viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian);
                  const lat = CMath.toDegrees(cartographic.latitude);
                  const lon = CMath.toDegrees(cartographic.longitude);
                  onMapClick([lat, lon]);
                }
              }
            }}
            type={ScreenSpaceEventType.LEFT_CLICK}
          />
        </ScreenSpaceEventHandler>

        <CameraFlyTo
          destination={targetPosition}
          duration={3}
          orientation={{
            heading: CMath.toRadians(0),
            pitch: CMath.toRadians(-50),
            roll: 0.0,
          }}
        />

        {/* User position marker */}
        <Entity
          position={Cartesian3.fromDegrees(userLocation[1], userLocation[0])}
          point={{
            pixelSize: 15,
            color: Color.fromCssColorString('#3B82F6'),
            outlineColor: Color.WHITE,
            outlineWidth: 3,
          }}
          description="Your current location"
        />

        {/* School boundary circle */}
        {schoolBoundary && (
          <Entity
            position={Cartesian3.fromDegrees(schoolBoundary.center[1], schoolBoundary.center[0])}
            ellipse={{
              semiMajorAxis: schoolBoundary.radius,
              semiMinorAxis: schoolBoundary.radius,
              material: Color.fromCssColorString('#3B82F6').withAlpha(0.15),
              outline: true,
              outlineColor: Color.fromCssColorString('#3B82F6').withAlpha(0.9),
              outlineWidth: 5,
              height: 0,
            }}
          />
        )}

        {/* Item markers */}
        {items.map(item => {
          const isRouting = activeRoute && activeRoute.id === item.id;
          return (
            <Entity
              key={item.id}
              position={Cartesian3.fromDegrees(item.coords[1], item.coords[0], isRouting ? 15 : 5)}
              onClick={() => handlePointClick(item)}
              billboard={{
                image: createMarkerImage(item.type, isRouting),
                scale: isRouting ? 1.2 : 0.8,
                verticalOrigin: 1,
              }}
            />
          );
        })}
      </Viewer>
    </div>
  );
};

const createMarkerImage = (type, isRouting) => {
  const color = type === 'lost' ? '#EF4444' : '#10B981';
  const stroke = isRouting ? '#FBBF24' : 'white';
  const sw = isRouting ? 3 : 2;
  // Added padding (4px on each side) to prevent stroke clipping
  const svg = `
    <svg width="48" height="56" viewBox="-4 -4 48 56" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 0C8.9543 0 0 8.9543 0 20C0 35 20 48 20 48C20 48 40 35 40 20C40 8.9543 31.0457 0 20 0Z" fill="${color}" stroke="${stroke}" stroke-width="${sw}"/>
      <circle cx="20" cy="20" r="7" fill="white" />
    </svg>
  `;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
};

export default MapView;
