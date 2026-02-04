import React, { useEffect, useState } from 'react';
import { Loader2, MapPin } from 'lucide-react';
import { Input } from './ui';
import { useLuxAddress } from '../hooks/useLuxAddress';
import { useLanguage } from '../contexts/LanguageContext';

export interface AddressFormData {
    street: string;
    number: string;
    postalCode: string;
    city: string; // locality
    country: string;
    floor?: string;
    residence?: string;
}

interface AddressAutocompleteProps {
    value: AddressFormData;
    onChange: (data: AddressFormData) => void;
    showDetails?: boolean; // Option to show floor/residence fields
    className?: string;
}

export const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({ value, onChange, showDetails = false, className }) => {
    const { t } = useLanguage();
    const { data: addressData, loading: isLoading } = useLuxAddress(value.postalCode);
    const streetInputRef = React.useRef<HTMLInputElement>(null);

    // Auto-fill City when Postal Code matches
    useEffect(() => {
        if (addressData?.city) {
            // Guard to prevent infinite loops since we are updating 'value' which is a dependency
            if (value.city !== addressData.city || value.country !== 'Luxembourg') {
                onChange({
                    ...value,
                    city: addressData.city,
                    country: 'Luxembourg' // Default
                });

                // Focus street input automatically for better UX
                setTimeout(() => {
                    streetInputRef.current?.focus();
                }, 100);
            }
        }
    }, [addressData, value, onChange]); // Added dependencies for safety

    const handleChange = (field: keyof AddressFormData, val: string) => {
        let newValue = val;

        // Special cleanups
        if (field === 'postalCode') {
            newValue = val.toUpperCase();
            if (!newValue.startsWith('L-') && newValue.length > 0) newValue = 'L-' + newValue;
            newValue = newValue.slice(0, 6);
        }

        onChange({ ...value, [field]: newValue });
    };

    return (
        <div className={`space-y-4 ${className}`}>

            {/* Country & Zip & City Row */}
            <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                    <Input
                        label="Code Postal" // Explicit label as requested
                        value={value.postalCode}
                        onChange={e => handleChange('postalCode', e.target.value)}
                        placeholder="L-XXXX"
                    />
                    {isLoading && (
                        <div className="absolute right-3 top-[38px] transform -translate-y-1/2">
                            <Loader2 className="animate-spin text-orange-500" size={18} />
                        </div>
                    )}
                </div>
                <Input
                    label={t.locality}
                    value={value.city}
                    onChange={e => handleChange('city', e.target.value)}
                    // Lock if API provided data, Unlock if API failed (or loading finished with no data)
                    readOnly={!!addressData?.city}
                    className={addressData?.city ? 'bg-slate-50 opacity-80' : ''} // Visual cue
                />
            </div>

            {/* Street & Number Row */}
            <div className="grid grid-cols-4 gap-3">
                <div className="col-span-3">
                    <Input
                        ref={streetInputRef}
                        label={t.street}
                        value={value.street}
                        onChange={e => handleChange('street', e.target.value)}
                    />
                </div>
                <div className="col-span-1">
                    <Input
                        label="N°"
                        value={value.number}
                        onChange={e => handleChange('number', e.target.value)}
                    />
                </div>
            </div>

            {/* Optional Details */}
            {showDetails && (
                <div className="grid grid-cols-2 gap-3">
                    <Input
                        label={t.residence || "Residence"}
                        value={value.residence || ''}
                        onChange={e => handleChange('residence', e.target.value)}
                        placeholder="Batiment A"
                    />
                    <Input
                        label={t.floor || "Floor"}
                        value={value.floor || ''}
                        onChange={e => handleChange('floor', e.target.value)}
                        placeholder="2"
                    />
                </div>
            )}
        </div>
    );
};
