
import { useState, useEffect } from 'react'
import MapView, { PROVIDER_GOOGLE, Marker, Polyline } from "react-native-maps";
import { useLocationStore } from '@/store/locationStore';
import { getDirections } from '@/utils/map';


const Map = () => {
    const { originCoords, destinationCoords, origin, destination } = useLocationStore();
    const [route, setRoute] = useState<number[][]>([]);
    const [region, setRegion] = useState({
        latitude: 9.082,
        longitude: 8.6753,
        latitudeDelta: 5,
        longitudeDelta: 5,
    });

    useEffect(() => {
        const fetchRoute = async () => {
            if (originCoords && destinationCoords) {
                const routeCoords = await getDirections(originCoords, destinationCoords);
                setRoute(routeCoords);
                // Zoom to fit
                const allCoords = [originCoords, destinationCoords, ...routeCoords];
                const lats = allCoords.map(c => c[0]);
                const lngs = allCoords.map(c => c[1]);
                const minLat = Math.min(...lats);
                const maxLat = Math.max(...lats);
                const minLng = Math.min(...lngs);
                const maxLng = Math.max(...lngs);
                setRegion({
                    latitude: (minLat + maxLat) / 2,
                    longitude: (minLng + maxLng) / 2,
                    latitudeDelta: Math.max(0.05, (maxLat - minLat) * 1.5),
                    longitudeDelta: Math.max(0.05, (maxLng - minLng) * 1.5),
                });
            }
        };
        fetchRoute();
    }, [originCoords, destinationCoords]);

    return (
        <MapView
            provider={PROVIDER_GOOGLE}
            style={{ height: '75%', width: '100%' }}
            tintColor={'black'}
            mapType={'standard'}
            showsUserLocation={true}
            userInterfaceStyle={'dark'}
            showsMyLocationButton={true}
            showsCompass={true}
            region={region}
        >
            {originCoords && (
                <Marker
                    coordinate={{ latitude: originCoords[0], longitude: originCoords[1] }}
                    title={origin ? origin : "Origin"}
                    description={origin ? origin : undefined}
                />
            )}
            {destinationCoords && (
                <Marker
                    coordinate={{ latitude: destinationCoords[0], longitude: destinationCoords[1] }}
                    title={destination ? destination : "Destination"}
                    description={destination ? destination : undefined}
                />
            )}
            {route.length > 0 && (
                <Polyline
                    coordinates={route.map(coord => ({ latitude: coord[0], longitude: coord[1] }))}
                    strokeColor="blue"
                    strokeWidth={4}
                />
            )}
        </MapView>
    );
}

export default Map
























// import { useEffect, useState } from 'react'
// import { FeatureCollection } from 'geojson';
// import Mapbox, { Camera, MapView, ShapeSource } from '@rnmapbox/maps';
// import { useLocationStore } from "@/store/locationStore";
// import { getDirections } from "@/utils/map";

// Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_KEY || '');

// const Map = ({ distance }: { distance: number }) => {
//     const { originCoords, destinationCoords } = useLocationStore();
//     const [route, setRoute] = useState<FeatureCollection | null>(null);
//     const [cameraPosition, setCameraPosition] = useState<{
//         center: [number, number],
//         zoom: number
//     } | null>(null);

//     useEffect(() => {
//         const fetchRoute = async () => {
//             try {
//                 if (!originCoords || !destinationCoords) {
//                     console.log('Missing coordinates');
//                     return;
//                 }

//                 const routeCoordinates = await getDirections(
//                     originCoords,
//                     destinationCoords
//                 );

//                 const routeGeoJSON: FeatureCollection = {
//                     type: 'FeatureCollection',
//                     features: [{
//                         type: 'Feature',
//                         properties: {},
//                         geometry: {
//                             type: 'LineString',
//                             coordinates: routeCoordinates
//                         }
//                     }]
//                 };

//                 setRoute(routeGeoJSON);

//                 if (routeCoordinates.length > 0) {
//                     const lngs = routeCoordinates.map(coord => coord[0]);
//                     const lats = routeCoordinates.map(coord => coord[1]);
//                     const minLng = Math.min(...lngs);
//                     const maxLng = Math.max(...lngs);
//                     const minLat = Math.min(...lats);
//                     const maxLat = Math.max(...lats);

//                     // Calculate the center of the bounds
//                     const center = [
//                         (minLng + maxLng) / 2,
//                         (minLat + maxLat) / 2,
//                     ];

//                     let zoom = distance <= 6 ? 15 : 11.75;

//                     if (Array.isArray(center) && center.length === 2) {
//                         setCameraPosition({
//                             center: center as [number, number],
//                             zoom
//                         });
//                     }
//                 }
//             } catch (error) {
//                 console.error('Error fetching route:', error);
//             }
//         };

//         fetchRoute();
//     }, [originCoords, destinationCoords, distance]);

//     return (
//         <MapView
//             style={{ flex: 1 }}
//             styleURL="mapbox://styles/mapbox/dark-v11"
//         >
//             <Camera
//                 zoomLevel={cameraPosition?.zoom}
//                 centerCoordinate={cameraPosition?.center}
//                 animationDuration={500}
//             />
//             {route && (
//                 <ShapeSource id="routeSource" shape={route}>
//                     <Mapbox.LineLayer
//                         id="routeLine"
//                         style={{
//                             lineColor: 'yellow',
//                             lineWidth: 5,
//                             lineOpacity: 0.7,
//                             lineCap: 'round',
//                             lineJoin: 'round'
//                         }}
//                     />
//                 </ShapeSource>
//             )}
//         </MapView>
//     );
// };

// export default Map;