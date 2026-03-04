
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { useCallback, useState } from 'react';

const containerStyle = {
    width: '100%',
    height: '100%',
    minHeight: '300px'
};

const defaultCenter = {
    lat: 20.5937,
    lng: 78.9629 // Center of India
};

interface MapProps {
    markers?: Array<{
        id: string | number;
        lat: number;
        lng: number;
        title?: string;
    }>;
    center?: {
        lat: number;
        lng: number;
    };
    onMarkerClick?: (id: string | number) => void;
}


const libraries: ("places" | "geometry" | "drawing" | "visualization")[] = ["places"];

export default function GoogleMapComponent({ markers = [], center = defaultCenter, onMarkerClick, onMapLoad }: MapProps & { onMapLoad?: (map: google.maps.Map) => void }) {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
        libraries
    });

    const [map, setMap] = useState<google.maps.Map | null>(null);

    const onLoad = useCallback(function callback(map: google.maps.Map) {
        const bounds = new window.google.maps.LatLngBounds();
        if (markers.length > 0) {
            markers.forEach(marker => {
                bounds.extend({ lat: marker.lat, lng: marker.lng });
            });
            map.fitBounds(bounds);
        } else {
            map.setCenter(center);
            map.setZoom(5);
        }
        setMap(map);
        if (onMapLoad) onMapLoad(map);
    }, [markers, center, onMapLoad]);

    const onUnmount = useCallback(function callback(map: google.maps.Map) {
        setMap(null);
    }, []);

    if (!isLoaded) {
        return <div className="h-full w-full bg-muted flex items-center justify-center">Loading Map...</div>;
    }

    return (
        <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={5}
            onLoad={onLoad}
            onUnmount={onUnmount}
            options={{
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: true,
            }}
        >
            {markers.map((marker) => (
                <Marker
                    key={marker.id}
                    position={{ lat: marker.lat, lng: marker.lng }}
                    title={marker.title}
                    onClick={() => onMarkerClick && onMarkerClick(marker.id)}
                />
            ))}
        </GoogleMap>
    );
}

