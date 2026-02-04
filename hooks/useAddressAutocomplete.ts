import { useState, useCallback } from 'react';
import axios from 'axios';

interface AddressData {
    city: string;
    state: string;
}

export const useAddressAutocomplete = () => {
    const [loading, setLoading] = useState(false);

    const fetchAddress = useCallback(async (postalCode: string): Promise<AddressData | null> => {
        // Only trigger for 4-digit codes (Luxembourg standard)
        if (!postalCode || postalCode.length !== 4) return null;

        setLoading(true);
        try {
            // Zippopotam.us for Luxembourg (LU)
            const response = await axios.get(`https://api.zippopotam.us/lu/${postalCode}`);

            if (response.data && response.data.places && response.data.places.length > 0) {
                const place = response.data.places[0];
                return {
                    city: place['place name'],
                    state: place['state'] || ''
                };
            }
            return null;
        } catch (error) {
            console.error("Error fetching address:", error);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    return { loading, fetchAddress };
};
