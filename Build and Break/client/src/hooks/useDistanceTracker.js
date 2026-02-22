import { useState, useEffect } from 'react';

// Standard Haversine formula to calculate straight-line GPS distance
export const calculateHaversine = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

// Custom hook to automatically track user location and calculate true GPS distances
export const useDistanceTracker = (itemsArray) => {
    const [userCoords, setUserCoords] = useState(null);
    const [itemsWithRealDistance, setItemsWithRealDistance] = useState(itemsArray);

    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
                setUserCoords({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
            }, (error) => {
                console.log("Location access denied or unavailable.");
            });
        }
    }, []);

    useEffect(() => {
        if (userCoords && itemsArray && itemsArray.length > 0) {
            const updatedItems = itemsArray.map(item => {
                if (item.lat && item.lng) {
                    // Calculate true physical GPS distance from user's actual device to the hospital/lab
                    // Multiply by 1.25 to approximate road/driving curvature vs mathematical straight-line
                    let trueDist = calculateHaversine(userCoords.lat, userCoords.lng, item.lat, item.lng) * 1.25;
                    return {
                        ...item,
                        // Overwrite the mock string with the highly accurate real-world calculation
                        distance: `${trueDist.toFixed(1)} km`,
                        calculatedDistance: trueDist
                    };
                }
                return item;
            });
            setItemsWithRealDistance(updatedItems);
        } else {
            setItemsWithRealDistance(itemsArray);
        }
    }, [userCoords, itemsArray]);

    return { userCoords, processedItems: itemsWithRealDistance };
};
