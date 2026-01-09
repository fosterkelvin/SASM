import { useState, useEffect, useCallback } from "react";

// PSGC API - Philippine Standard Geographic Code
// Using the PSGC API from https://psgc.gitlab.io/api/

interface Region {
  code: string;
  name: string;
  regionName: string;
  islandGroupCode: string;
  psgc10DigitCode: string;
}

interface Province {
  code: string;
  name: string;
  regionCode: string;
  islandGroupCode: string;
  psgc10DigitCode: string;
}

interface CityMunicipality {
  code: string;
  name: string;
  provinceCode?: string;
  districtCode?: string;
  regionCode: string;
  islandGroupCode: string;
  psgc10DigitCode: string;
  isCapital?: boolean;
  isCity?: boolean;
  isMunicipality?: boolean;
}

interface Barangay {
  code: string;
  name: string;
  cityCode?: string;
  municipalityCode?: string;
  subMunicipalityCode?: string;
  provinceCode?: string;
  districtCode?: string;
  regionCode: string;
  islandGroupCode: string;
  psgc10DigitCode: string;
}

// Base URL for PSGC API
const PSGC_API_BASE = "https://psgc.gitlab.io/api";

export function usePhilippineAddress() {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [cities, setCities] = useState<CityMunicipality[]>([]);
  const [barangays, setBarangays] = useState<Barangay[]>([]);
  const [loading, setLoading] = useState({
    provinces: false,
    cities: false,
    barangays: false,
  });
  const [error, setError] = useState<string | null>(null);

  // Fetch all provinces on mount
  useEffect(() => {
    const fetchProvinces = async () => {
      setLoading((prev) => ({ ...prev, provinces: true }));
      try {
        const response = await fetch(`${PSGC_API_BASE}/provinces.json`);
        if (!response.ok) throw new Error("Failed to fetch provinces");
        const data: Province[] = await response.json();
        // Sort alphabetically by name
        setProvinces(data.sort((a, b) => a.name.localeCompare(b.name)));
      } catch (err) {
        console.error("Error fetching provinces:", err);
        setError("Failed to load provinces");
      } finally {
        setLoading((prev) => ({ ...prev, provinces: false }));
      }
    };

    fetchProvinces();
  }, []);

  // Fetch cities/municipalities for a given province
  const fetchCities = useCallback(async (provinceCode: string) => {
    if (!provinceCode) {
      setCities([]);
      return;
    }

    setLoading((prev) => ({ ...prev, cities: true }));
    setBarangays([]); // Clear barangays when province changes
    
    try {
      const response = await fetch(
        `${PSGC_API_BASE}/provinces/${provinceCode}/cities-municipalities.json`
      );
      if (!response.ok) throw new Error("Failed to fetch cities");
      const data: CityMunicipality[] = await response.json();
      setCities(data.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (err) {
      console.error("Error fetching cities:", err);
      setError("Failed to load cities/municipalities");
      setCities([]);
    } finally {
      setLoading((prev) => ({ ...prev, cities: false }));
    }
  }, []);

  // Fetch barangays for a given city/municipality
  const fetchBarangays = useCallback(async (cityMunicipalityCode: string) => {
    if (!cityMunicipalityCode) {
      setBarangays([]);
      return;
    }

    setLoading((prev) => ({ ...prev, barangays: true }));
    
    try {
      const response = await fetch(
        `${PSGC_API_BASE}/cities-municipalities/${cityMunicipalityCode}/barangays.json`
      );
      if (!response.ok) throw new Error("Failed to fetch barangays");
      const data: Barangay[] = await response.json();
      setBarangays(data.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (err) {
      console.error("Error fetching barangays:", err);
      setError("Failed to load barangays");
      setBarangays([]);
    } finally {
      setLoading((prev) => ({ ...prev, barangays: false }));
    }
  }, []);

  // Reset cities and barangays
  const resetCities = useCallback(() => {
    setCities([]);
    setBarangays([]);
  }, []);

  const resetBarangays = useCallback(() => {
    setBarangays([]);
  }, []);

  return {
    provinces,
    cities,
    barangays,
    loading,
    error,
    fetchCities,
    fetchBarangays,
    resetCities,
    resetBarangays,
  };
}

// Separate hook for Baguio/Benguet address (limited to Baguio City and Benguet province)
export function useBaguioBenguetAddress() {
  const [cities, setCities] = useState<CityMunicipality[]>([]);
  const [barangays, setBarangays] = useState<Barangay[]>([]);
  const [loading, setLoading] = useState({
    cities: false,
    barangays: false,
  });
  const [error, setError] = useState<string | null>(null);

  // Benguet province code is "141100000" and Baguio City code is "141102000"
  const BENGUET_CODE = "141100000";
  const BAGUIO_CITY_CODE = "141102000";

  // Fetch Baguio/Benguet cities on mount
  useEffect(() => {
    const fetchBaguioBenguetCities = async () => {
      setLoading((prev) => ({ ...prev, cities: true }));
      try {
        // Fetch Benguet municipalities
        const benguetResponse = await fetch(
          `${PSGC_API_BASE}/provinces/${BENGUET_CODE}/cities-municipalities.json`
        );
        if (!benguetResponse.ok) throw new Error("Failed to fetch cities");
        const benguetData: CityMunicipality[] = await benguetResponse.json();
        
        // Sort and set cities (Baguio City will be included in Benguet's cities)
        setCities(benguetData.sort((a, b) => a.name.localeCompare(b.name)));
      } catch (err) {
        console.error("Error fetching Baguio/Benguet cities:", err);
        setError("Failed to load cities");
      } finally {
        setLoading((prev) => ({ ...prev, cities: false }));
      }
    };

    fetchBaguioBenguetCities();
  }, []);

  // Fetch barangays for a given city/municipality
  const fetchBarangays = useCallback(async (cityMunicipalityCode: string) => {
    if (!cityMunicipalityCode) {
      setBarangays([]);
      return;
    }

    setLoading((prev) => ({ ...prev, barangays: true }));
    
    try {
      const response = await fetch(
        `${PSGC_API_BASE}/cities-municipalities/${cityMunicipalityCode}/barangays.json`
      );
      if (!response.ok) throw new Error("Failed to fetch barangays");
      const data: Barangay[] = await response.json();
      setBarangays(data.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (err) {
      console.error("Error fetching barangays:", err);
      setError("Failed to load barangays");
      setBarangays([]);
    } finally {
      setLoading((prev) => ({ ...prev, barangays: false }));
    }
  }, []);

  const resetBarangays = useCallback(() => {
    setBarangays([]);
  }, []);

  return {
    cities,
    barangays,
    loading,
    error,
    fetchBarangays,
    resetBarangays,
  };
}
