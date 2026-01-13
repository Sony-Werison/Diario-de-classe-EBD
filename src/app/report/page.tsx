

"use client";

import React, { useState } from 'react';
import { MonthlyReport } from "@/components/monthly-report";
import { MonthlyStudentReport } from '@/components/monthly-student-report';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, User } from 'lucide-react';

export default function ReportPage() {
    const [activeTab, setActiveTab] = useState("monthly");

    return (
        <div className="p-4 sm:p-6 text-white bg-background flex-1 flex flex-col">
            <header className="mb-6">
                <h1 className="text-2xl font-bold">Relatórios</h1>
                <p className="text-slate-400">Analise o desempenho da turma ou de alunos individuais.</p>
            </header>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                <TabsList className="grid w-full grid-cols-2 sm:max-w-md bg-card border-border mb-4">
                    <TabsTrigger value="monthly" className="gap-2">
                        <Users size={16} /> Relatório Mensal
                    </TabsTrigger>
                    <TabsTrigger value="individual" className="gap-2">
                        <User size={16} /> Relatório Individual
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="monthly" className="flex-1 flex flex-col">
                    <MonthlyReport />
                </TabsContent>
                <TabsContent value="individual" className="flex-1 flex flex-col">
                    <MonthlyStudentReport />
                </TabsContent>
            </Tabs>
        </div>
    );
}
