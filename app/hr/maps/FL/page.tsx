"use client";
import React, { useState, useEffect } from "react";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import { EosIconsBubbleLoading } from "@/components/spinner";
import { useSession } from "next-auth/react";
import NotAuth from "@/components/auth/notAuth";
import { flTechs } from "../../hrActions";
import { title } from "process";

const mapContainerStyle = {
    width: "100%",
    height: "900px",
};

const floridaCenter = {
    lat: 27.994402, // Latitude of Florida's approximate center
    lng: -81.760254, // Longitude of Florida's approximate center
};

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY; // Replace with your actual API key

export default function FloridaMap() {
    const { data: session } = useSession();
    const { isLoaded } = useLoadScript({
        googleMapsApiKey: apiKey as string,
        libraries: ["places"],
    });

    const [addresses, setAddresses] = useState<
        { address: string; label: string, title: string }[]
    >([]); // Addresses with labels
    const [markers, setMarkers] = useState<
        {
            title: string | undefined; lat: number; lng: number; label: string 
}[]
    >([]); // Geocoded marker positions with labels

    useEffect(() => {
        if (!isLoaded) return; // Ensure the script is loaded
    
        const loadAddresses = async () => {
            const responseData = await flTechs();
            
            
            const addressList = responseData.map((item) => ({
                address: `${item.address}, ${item.city}, ${item.state}`, // Combine address, city, and state
                label: `${item.preferedName[0].toUpperCase()}${item.lastname[0].toUpperCase()}`, 
                title: `${item.preferedName} ${item.lastname}` // Add the full name to the title
              }));
            setAddresses(addressList);
        };
    
        loadAddresses();
    }, [isLoaded]); // Depend on `isLoaded`
    
      // Geocode addresses and set markers
      useEffect(() => {
        if (!isLoaded) return; // Ensure the script is loaded
    
        const geocodeAddresses = async () => {
            const geocoder = new window.google.maps.Geocoder();
            const results: { lat: number; lng: number; label: string, title: string }[] = [];
    
            const geocodeAddress = async (address: string): Promise<google.maps.GeocoderResult[]> => {
                return new Promise((resolve, reject) => {
                    geocoder.geocode({ address }, (results, status) => {
                        if (status === "OK" && results) {
                            resolve(results);
                        } else {
                            reject(new Error(`Geocoding failed for address "${address}": ${status}`));
                        }
                    });
                });
            };
    
            for (const { address, label, title} of addresses) {
                try {
                    const response = await geocodeAddress(address);
                    const location = response[0].geometry.location;
                    results.push({
                        lat: location.lat(),
                        lng: location.lng(),
                        label,
                        title,
                        
                    });
                } catch (error: any) {
                    console.error(error.message);
                }
            }
    
            setMarkers(results);
            console.log("results", results);
        };
    
        if (addresses.length > 0) {
            geocodeAddresses();
        }
    }, [addresses, isLoaded]); // Depend on `isLoaded`

    if (!isLoaded) {
        return (
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100vh",
                }}
            >
                <EosIconsBubbleLoading />
            </div>
        );
    }

    if (
        !session?.roles?.some((role) =>
            ["Managers", "Human Resources", "Finance"].includes(role)
        )
    ) {
        return <NotAuth />;
    }


    return (
        <div>
            <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={floridaCenter}
                zoom={7.5} // Zoom level to show most of Florida
            >
                {markers.map((marker, index) => (
                    <Marker
                        key={index}
                        position={{ lat: marker.lat, lng: marker.lng }}
                        label={marker.label} // Add the label to the marker
                        title={marker.title} // Add the label to the marker title
                    />
                ))}
            </GoogleMap>
        </div>
    );
};
