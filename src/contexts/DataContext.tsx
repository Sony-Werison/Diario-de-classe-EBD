
"use client";

import React, { createContext, useState, useEffect, useCallback } from 'react';
import { getSimulatedData, saveSimulatedData, SimulatedFullData } from '@/lib/data';

interface DataContextType {
    fullData: SimulatedFullData | null;
    isLoading: boolean;
    error: Error | null;
    updateAndSaveData: (updater: (prevData: SimulatedFullData) => SimulatedFullData) => void;
}

export const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
    const [fullData, setFullData] = useState<SimulatedFullData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true);
                const data = await getSimulatedData();
                setFullData(data);
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
        setFullData(prevData => {
            if (!prevData) return null;
            const newData = updater(prevData);
            // Asynchronously save to backend without blocking UI updates
            saveSimulatedData(newData);
            return newData;
        });
    }, []);

    const value = {
        fullData,
        isLoading,
        error,
        updateAndSaveData,
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};
