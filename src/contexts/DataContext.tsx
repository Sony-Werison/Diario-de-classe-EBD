
"use client";

import React, { createContext, useState, useEffect, useCallback } from 'react';
import { getSimulatedData, saveSimulatedData, SimulatedFullData, getInitialData } from '@/lib/data';

interface DataContextType {
    fullData: SimulatedFullData | null;
    isLoading: boolean;
    isDemo: boolean;
    error: Error | null;
    updateAndSaveData: (updater: (prevData: SimulatedFullData) => SimulatedFullData) => void;
}

export const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
    const [fullData, setFullData] = useState<SimulatedFullData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [isDemo, setIsDemo] = useState(false);

    useEffect(() => {
        const isDemoMode = sessionStorage.getItem('isDemo') === 'true';
        setIsDemo(isDemoMode);

        const loadData = async () => {
            try {
                setIsLoading(true);
                if (isDemoMode) {
                    setFullData(getInitialData());
                } else {
                    const data = await getSimulatedData();
                    setFullData(data);
                }
            } catch (err) {
                setError(err as Error);
                console.error("Failed to load data in context", err);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    const updateAndSaveData = useCallback((updater: (prevData: SimulatedFullData) => SimulatedFullData) => {
        if (isDemo) return; // Prevent saving in demo mode
        
        setFullData(prevData => {
            if (!prevData) return null;
            const newData = updater(prevData);
            // Asynchronously save to backend without blocking UI updates
            saveSimulatedData(newData);
            return newData;
        });
    }, [isDemo]);

    const value = {
        fullData,
        isLoading,
        isDemo,
        error,
        updateAndSaveData,
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};
