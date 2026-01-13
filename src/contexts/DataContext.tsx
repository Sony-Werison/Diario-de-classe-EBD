
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
        // This effect runs only once on the client
        const demoStatus = sessionStorage.getItem('isDemo') === 'true';
        setIsDemo(demoStatus);

        const loadData = async () => {
            try {
                setIsLoading(true);
                if (demoStatus) {
                    // In demo mode, always load fresh initial data. Don't fetch from backend.
                    setFullData(getInitialData());
                } else {
                    // In normal mode, fetch user's real data.
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
        // isDemo state is checked here to prevent saving data in demo mode
        if (isDemo) {
            console.warn("Saving is disabled in Demo Mode.");
            // In demo mode, we can still update the local state for UI interactivity, but we won't save it.
             setFullData(prevData => {
                if (!prevData) return null;
                const newData = updater(prevData);
                return newData;
            });
            return;
        } 
        
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
