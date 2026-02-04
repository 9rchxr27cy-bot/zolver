import { useState, useEffect } from 'react';

interface LuxAddressData {
  city: string;
  state: string;
  streets: string[];
}

// Static fallback dataset for common Luxembourg postal codes
const LUX_POSTAL_DATA: Record<string, { city: string; state: string }> = {
  '1': { city: 'Luxembourg', state: 'Luxembourg' },
  '1011': { city: 'Luxembourg', state: 'Luxembourg' },
  '1118': { city: 'Luxembourg', state: 'Luxembourg' },
  '1130': { city: 'Luxembourg', state: 'Luxembourg' },
  '1140': { city: 'Luxembourg', state: 'Luxembourg' },
  '1145': { city: 'Luxembourg', state: 'Luxembourg' },
  '1210': { city: 'Luxembourg', state: 'Luxembourg' },
  '1219': { city: 'Luxembourg', state: 'Luxembourg' },
  '1220': { city: 'Luxembourg', state: 'Luxembourg' },
  '1225': { city: 'Luxembourg', state: 'Luxembourg' },
  '1233': { city: 'Luxembourg', state: 'Luxembourg' },
  '1244': { city: 'Luxembourg', state: 'Luxembourg' },
  '1246': { city: 'Luxembourg', state: 'Luxembourg' },
  '1247': { city: 'Luxembourg', state: 'Luxembourg' },
  '1273': { city: 'Luxembourg', state: 'Luxembourg' },
  '1320': { city: 'Luxembourg', state: 'Luxembourg' },
  '1325': { city: 'Luxembourg', state: 'Luxembourg' },
  '1347': { city: 'Luxembourg', state: 'Luxembourg' },
  '1348': { city: 'Luxembourg', state: 'Luxembourg' },
  '1349': { city: 'Luxembourg', state: 'Luxembourg' },
  '1420': { city: 'Luxembourg', state: 'Luxembourg' },
  '1430': { city: 'Luxembourg', state: 'Luxembourg' },
  '1445': { city: 'Luxembourg', state: 'Luxembourg' },
  '1460': { city: 'Luxembourg', state: 'Luxembourg' },
  '1470': { city: 'Luxembourg', state: 'Luxembourg' },
  '1471': { city: 'Luxembourg', state: 'Luxembourg' },
  '1511': { city: 'Luxembourg', state: 'Luxembourg' },
  '1528': { city: 'Luxembourg', state: 'Luxembourg' },
  '1536': { city: 'Luxembourg', state: 'Luxembourg' },
  '1610': { city: 'Luxembourg', state: 'Luxembourg' },
  '1611': { city: 'Luxembourg', state: 'Luxembourg' },
  '1616': { city: 'Luxembourg', state: 'Luxembourg' },
  '1626': { city: 'Luxembourg', state: 'Luxembourg' },
  '1631': { city: 'Luxembourg', state: 'Luxembourg' },
  '1650': { city: 'Luxembourg', state: 'Luxembourg' },
  '1653': { city: 'Luxembourg', state: 'Luxembourg' },
  '1660': { city: 'Luxembourg', state: 'Luxembourg' },
  '1728': { city: 'Luxembourg', state: 'Luxembourg' },
  '1736': { city: 'Luxembourg', state: 'Luxembourg' },
  '1740': { city: 'Luxembourg', state: 'Luxembourg' },
  '1750': { city: 'Luxembourg', state: 'Luxembourg' },
  '1882': { city: 'Luxembourg', state: 'Luxembourg' },
  '2134': { city: 'Luxembourg', state: 'Luxembourg' },
  '2143': { city: 'Luxembourg', state: 'Luxembourg' },
  '2146': { city: 'Luxembourg', state: 'Luxembourg' },
  '2163': { city: 'Luxembourg', state: 'Luxembourg' },
  '2213': { city: 'Luxembourg', state: 'Luxembourg' },
  '2227': { city: 'Luxembourg', state: 'Luxembourg' },
  '2312': { city: 'Luxembourg', state: 'Luxembourg' },
  '2320': { city: 'Luxembourg', state: 'Luxembourg' },
  '2450': { city: 'Luxembourg', state: 'Luxembourg' },
  '2530': { city: 'Luxembourg', state: 'Luxembourg' },
  '2540': { city: 'Luxembourg', state: 'Luxembourg' },
  '2730': { city: 'Luxembourg', state: 'Luxembourg' },
  '2733': { city: 'Luxembourg', state: 'Luxembourg' },
  '2740': { city: 'Luxembourg', state: 'Luxembourg' },
  '2763': { city: 'Luxembourg', state: 'Luxembourg' },
  '2920': { city: 'Luxembourg', state: 'Luxembourg' },
  '3214': { city: 'Bettembourg', state: 'Luxembourg' },
  '3450': { city: 'Dudelange', state: 'Luxembourg' },
  '3471': { city: 'Dudelange', state: 'Luxembourg' },
  '3510': { city: 'Dudelange', state: 'Luxembourg' },
  '3540': { city: 'Dudelange', state: 'Luxembourg' },
  '3615': { city: 'Kayl', state: 'Luxembourg' },
  '4001': { city: 'Esch-sur-Alzette', state: 'Luxembourg' },
  '4015': { city: 'Esch-sur-Alzette', state: 'Luxembourg' },
  '4025': { city: 'Esch-sur-Alzette', state: 'Luxembourg' },
  '4030': { city: 'Esch-sur-Alzette', state: 'Luxembourg' },
  '4123': { city: 'Esch-sur-Alzette', state: 'Luxembourg' },
  '4140': { city: 'Esch-sur-Alzette', state: 'Luxembourg' },
  '4210': { city: 'Esch-sur-Alzette', state: 'Luxembourg' },
  '4221': { city: 'Esch-sur-Alzette', state: 'Luxembourg' },
  '4351': { city: 'Esch-sur-Alzette', state: 'Luxembourg' },
  '4362': { city: 'Esch-sur-Alzette', state: 'Luxembourg' },
  '4411': { city: 'Sanem', state: 'Luxembourg' },
  '4557': { city: 'Differdange', state: 'Luxembourg' },
  '4735': { city: 'Pétange', state: 'Luxembourg' },
  '5401': { city: 'Ahn', state: 'Grevenmacher' },
  '5445': { city: 'Schengen', state: 'Grevenmacher' },
  '5610': { city: 'Mondorf-les-Bains', state: 'Grevenmacher' },
  '6460': { city: 'Echternach', state: 'Grevenmacher' },
  '7220': { city: 'Walferdange', state: 'Luxembourg' },
  '7240': { city: 'Bereldange', state: 'Luxembourg' },
  '7233': { city: 'Helmsange', state: 'Luxembourg' },
  '7535': { city: 'Mersch', state: 'Mersch' },
  '8080': { city: 'Bertrange', state: 'Luxembourg' },
  '8210': { city: 'Mamer', state: 'Capellen' },
  '8308': { city: 'Capellen', state: 'Capellen' },
  '8440': { city: 'Steinfort', state: 'Capellen' },
  '9010': { city: 'Ettelbruck', state: 'Diekirch' },
  '9053': { city: 'Ettelbruck', state: 'Diekirch' },
  '9240': { city: 'Diekirch', state: 'Diekirch' },
  '9401': { city: 'Vianden', state: 'Diekirch' },
  '9531': { city: 'Wiltz', state: 'Wiltz' }
};

export const useLuxAddress = (zipCode: string | undefined | null) => {
  const [data, setData] = useState<LuxAddressData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!zipCode) {
      setData(null);
      return;
    }

    const cleanZip = (zipCode || '').replace(/[^0-9]/g, '');

    if (cleanZip.length === 4) {
      setLoading(true);

      // Use static dataset directly (more reliable than API)
      setTimeout(() => {
        const staticData = LUX_POSTAL_DATA[cleanZip];
        if (staticData) {
          setData({
            city: staticData.city,
            state: staticData.state,
            streets: []
          });
        } else {
          // Allow manual entry for codes not in dataset
          setData(null);
        }
        setLoading(false);
      }, 100); // Small delay to show loading state

    } else {
      setData(null);
    }
  }, [zipCode]);

  return { data, loading };
};