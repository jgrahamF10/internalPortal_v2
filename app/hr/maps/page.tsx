"use client";
import React, { useState, useEffect } from "react";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import { EosIconsBubbleLoading } from "@/components/spinner";
import { useSession } from "next-auth/react";
import NotAuth from "@/components/auth/notAuth";
import { TechMap } from "../hrActions";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const mapContainerStyle = {
    width: "100%",
    height: "900px",
};

const stateCenters = {
    Alabama: { lat: 32.806671, lng: -86.79113 },
    Alaska: { lat: 64.200841, lng: -149.493673 },
    Arizona: { lat: 34.048928, lng: -111.093731 },
    Arkansas: { lat: 34.969704, lng: -92.373123 },
    California: { lat: 36.778259, lng: -119.417931 },
    Colorado: { lat: 39.550051, lng: -105.782067 },
    Connecticut: { lat: 41.603221, lng: -73.087749 },
    Delaware: { lat: 38.910832, lng: -75.52767 },
    Florida: { lat: 27.994402, lng: -81.760254 },
    Georgia: { lat: 32.165622, lng: -82.900075 },
    Hawaii: { lat: 19.896766, lng: -155.582782 },
    Idaho: { lat: 44.068202, lng: -114.742041 },
    Illinois: { lat: 40.633125, lng: -89.398528 },
    Indiana: { lat: 40.267194, lng: -86.134902 },
    Iowa: { lat: 41.878003, lng: -93.097702 },
    Kansas: { lat: 39.011902, lng: -98.484246 },
    Kentucky: { lat: 37.839333, lng: -84.270018 },
    Louisiana: { lat: 30.984298, lng: -91.962333 },
    Maine: { lat: 45.253783, lng: -69.445469 },
    Maryland: { lat: 39.045755, lng: -76.641271 },
    Massachusetts: { lat: 42.407211, lng: -71.382437 },
    Michigan: { lat: 44.314844, lng: -85.602364 },
    Minnesota: { lat: 46.729553, lng: -94.6859 },
    Mississippi: { lat: 32.354668, lng: -89.398528 },
    Missouri: { lat: 37.964253, lng: -91.831833 },
    Montana: { lat: 46.879682, lng: -110.362566 },
    Nebraska: { lat: 41.492537, lng: -99.901813 },
    Nevada: { lat: 38.80261, lng: -116.419389 },
    "New Hampshire": { lat: 43.193852, lng: -71.572395 },
    "New Jersey": { lat: 40.058324, lng: -74.405661 },
    "New Mexico": { lat: 34.51994, lng: -105.87009 },
    "New York": { lat: 43.299428, lng: -74.217933 },
    "North Carolina": { lat: 35.759573, lng: -79.0193 },
    "North Dakota": { lat: 47.551493, lng: -101.002012 },
    Ohio: { lat: 40.417287, lng: -82.907123 },
    Oklahoma: { lat: 35.007752, lng: -97.092877 },
    Oregon: { lat: 43.804133, lng: -120.554201 },
    Pennsylvania: { lat: 41.203322, lng: -77.194525 },
    "Rhode Island": { lat: 41.580095, lng: -71.477429 },
    "South Carolina": { lat: 33.836081, lng: -81.163725 },
    "South Dakota": { lat: 43.969515, lng: -99.901813 },
    Tennessee: { lat: 35.517491, lng: -86.580447 },
    Texas: { lat: 31.968599, lng: -99.901813 },
    Utah: { lat: 39.32098, lng: -111.093731 },
    Vermont: { lat: 44.558803, lng: -72.577841 },
    Virginia: { lat: 37.431573, lng: -78.656894 },
    Washington: { lat: 47.751074, lng: -120.740139 },
    "West Virginia": { lat: 38.597626, lng: -80.454903 },
    Wisconsin: { lat: 43.78444, lng: -88.787868 },
    Wyoming: { lat: 43.075968, lng: -107.290284 },
};

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY; // Replace with your actual API key

export default function StateMap() {
    const { data: session } = useSession();
    const { isLoaded } = useLoadScript({
        googleMapsApiKey: apiKey as string,
        libraries: ["places"],
    });

    const [selectedState, setSelectedState] = useState("Florida"); // Default to Florida
    const [addresses, setAddresses] = useState<
        { address: string; label: string; title: string }[]
    >([]);
    const [markers, setMarkers] = useState<
        { title: string | undefined; lat: number; lng: number; label: string }[]
    >([]);

    useEffect(() => {
        if (!isLoaded || !selectedState) return;

        const loadAddresses = async () => {
            try {
                const responseData = await TechMap(
                    selectedState as
                        | "Florida"
                        | "Alabama"
                        | "Alaska"
                        | "Arizona"
                        | "Arkansas"
                        | "California"
                        | "Colorado"
                        | "Connecticut"
                        | "Delaware"
                        | "Georgia"
                        | "Hawaii"
                        | "Idaho"
                        | "Illinois"
                        | "Indiana"
                        | "Iowa"
                        | "Kansas"
                        | "Kentucky"
                        | "Louisiana"
                        | "Maine"
                        | "Maryland"
                        | "Massachusetts"
                        | "Michigan"
                        | "Minnesota"
                        | "Mississippi"
                        | "Missouri"
                        | "Montana"
                        | "Nebraska"
                        | "Nevada"
                        | "New Hampshire"
                        | "New Jersey"
                        | "New Mexico"
                        | "New York"
                        | "North Carolina"
                        | "North Dakota"
                        | "Ohio"
                        | "Oklahoma"
                        | "Oregon"
                        | "Pennsylvania"
                        | "Rhode Island"
                        | "South Carolina"
                        | "South Dakota"
                        | "Tennessee"
                        | "Texas"
                        | "Utah"
                        | "Vermont"
                        | "Virginia"
                        | "Washington"
                        | "West Virginia"
                        | "Wisconsin"
                        | "Wyoming"
                ); // Pass the selected state
                const addressList = responseData.map((item) => ({
                    address: `${item.address}, ${item.city}, ${item.state}`,
                    label: `${item.preferedName[0].toUpperCase()}${item.lastname[0].toUpperCase()}`,
                    title: `${item.preferedName} ${item.lastname}`,
                }));
                setAddresses(addressList);
            } catch (error) {
                console.error("Failed to load addresses:", error);
            }
        };

        loadAddresses();
    }, [isLoaded, selectedState]); // Re-run when isLoaded or selectedState changes

    useEffect(() => {
        if (!isLoaded || addresses.length === 0) return;

        const geocodeAddresses = async () => {
            const geocoder = new window.google.maps.Geocoder();
            const results: {
                lat: number;
                lng: number;
                label: string;
                title: string;
            }[] = [];

            const geocodeAddress = async (
                address: string
            ): Promise<google.maps.GeocoderResult[]> => {
                return new Promise((resolve, reject) => {
                    geocoder.geocode({ address }, (results, status) => {
                        if (status === "OK" && results) {
                            resolve(results);
                        } else {
                            reject(
                                new Error(
                                    `Geocoding failed for address "${address}": ${status}`
                                )
                            );
                        }
                    });
                });
            };

            for (const { address, label, title } of addresses) {
                try {
                    const response = await geocodeAddress(address);
                    const location = response[0].geometry.location;
                    results.push({
                        lat: location.lat(),
                        lng: location.lng(),
                        label,
                        title,
                    });
                } catch (error) {
                    console.error("Geocoding error:", error);
                }
            }

            setMarkers(results);
        };

        geocodeAddresses();
    }, [addresses, isLoaded]);

    if (!isLoaded) {
        return (
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100",
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
            <div className="flex justify-center items-center mb-4">
                <div className="flex flex-col gap-2">
                    <Select
                        onValueChange={(value) => setSelectedState(value)} // Update selectedState
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select State" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value="Alabama">Alabama</SelectItem>
                                <SelectItem value="Alaska">Alaska</SelectItem>
                                <SelectItem value="Arizona">Arizona</SelectItem>
                                <SelectItem value="Arkansas">
                                    Arkansas
                                </SelectItem>
                                <SelectItem value="California">
                                    California
                                </SelectItem>
                                <SelectItem value="Colorado">
                                    Colorado
                                </SelectItem>
                                <SelectItem value="Connecticut">
                                    Connecticut
                                </SelectItem>
                                <SelectItem value="Delaware">
                                    Delaware
                                </SelectItem>
                                <SelectItem value="Florida">Florida</SelectItem>
                                <SelectItem value="Georgia">Georgia</SelectItem>
                                <SelectItem value="Hawaii">Hawaii</SelectItem>
                                <SelectItem value="Idaho">Idaho</SelectItem>
                                <SelectItem value="Illinois">
                                    Illinois
                                </SelectItem>
                                <SelectItem value="Indiana">Indiana</SelectItem>
                                <SelectItem value="Iowa">Iowa</SelectItem>
                                <SelectItem value="Kansas">Kansas</SelectItem>
                                <SelectItem value="Kentucky">
                                    Kentucky
                                </SelectItem>
                                <SelectItem value="Louisiana">
                                    Louisiana
                                </SelectItem>
                                <SelectItem value="Maine">Maine</SelectItem>
                                <SelectItem value="Maryland">
                                    Maryland
                                </SelectItem>
                                <SelectItem value="Massachusetts">
                                    Massachusetts
                                </SelectItem>
                                <SelectItem value="Michigan">
                                    Michigan
                                </SelectItem>
                                <SelectItem value="Minnesota">
                                    Minnesota
                                </SelectItem>
                                <SelectItem value="Mississippi">
                                    Mississippi
                                </SelectItem>
                                <SelectItem value="Missouri">
                                    Missouri
                                </SelectItem>
                                <SelectItem value="Montana">Montana</SelectItem>
                                <SelectItem value="Nebraska">
                                    Nebraska
                                </SelectItem>
                                <SelectItem value="Nevada">Nevada</SelectItem>
                                <SelectItem value="New Hampshire">
                                    New Hampshire
                                </SelectItem>
                                <SelectItem value="New Jersey">
                                    New Jersey
                                </SelectItem>
                                <SelectItem value="New Mexico">
                                    New Mexico
                                </SelectItem>
                                <SelectItem value="New York">
                                    New York
                                </SelectItem>
                                <SelectItem value="North Carolina">
                                    North Carolina
                                </SelectItem>
                                <SelectItem value="North Dakota">
                                    North Dakota
                                </SelectItem>
                                <SelectItem value="Ohio">Ohio</SelectItem>
                                <SelectItem value="Oklahoma">
                                    Oklahoma
                                </SelectItem>
                                <SelectItem value="Oregon">Oregon</SelectItem>
                                <SelectItem value="Pennsylvania">
                                    Pennsylvania
                                </SelectItem>
                                <SelectItem value="Rhode Island">
                                    Rhode Island
                                </SelectItem>
                                <SelectItem value="South Carolina">
                                    South Carolina
                                </SelectItem>
                                <SelectItem value="South Dakota">
                                    South Dakota
                                </SelectItem>
                                <SelectItem value="Tennessee">
                                    Tennessee
                                </SelectItem>
                                <SelectItem value="Texas">Texas</SelectItem>
                                <SelectItem value="Utah">Utah</SelectItem>
                                <SelectItem value="Vermont">Vermont</SelectItem>
                                <SelectItem value="Virginia">
                                    Virginia
                                </SelectItem>
                                <SelectItem value="Washington">
                                    Washington
                                </SelectItem>
                                <SelectItem value="West Virginia">
                                    West Virginia
                                </SelectItem>
                                <SelectItem value="Wisconsin">
                                    Wisconsin
                                </SelectItem>
                                <SelectItem value="Wyoming">Wyoming</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={
                    stateCenters[selectedState as keyof typeof stateCenters]
                }
                zoom={6.5}
            >
                {markers.map((marker, index) => (
                    <Marker
                        key={index}
                        position={{ lat: marker.lat, lng: marker.lng }}
                        label={marker.label}
                        title={marker.title}
                    />
                ))}
            </GoogleMap>
        </div>
    );
}
