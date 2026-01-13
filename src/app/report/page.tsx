
"use client";

import React, { useState } from 'react';
import { MonthlyReport } from "@/components/monthly-report";
import { MonthlyStudentReport } from '@/components/monthly-student-report';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, User, LayoutDashboard } from 'lucide-react';
import { OverviewReport } from '@/components/overview-report';

export default function ReportPage() {
    const [activeTab, setActiveTab] = useState("overview");

    return (
        <div className="p-4 sm:p-6 text-white bg-background flex-1 flex flex-col">
            <header className="mb-6">
                <h1 className="text-2xl font-bold">Relatórios</h1>
                <p className="text-slate-400">Analise o desempenho da turma ou de alunos individuais.</p>
            </header>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                <TabsList className="grid w-full grid-cols-3 sm:max-w-xl bg-card border-border mb-4">
                     <TabsTrigger value="overview" className="gap-2">
                        <LayoutDashboard size={16} /> Visão Geral
                    </TabsTrigger>
                    <TabsTrigger value="monthly" className="gap-2">
                        <Users size={16} /> Relatório Mensal
                    </TabsTrigger>
                    <TabsTrigger value="individual" className="gap-2">
                        <User size={16} /> Relatório Individual
                    </TabsTrigger>
                </TabsList>
                 <TabsContent value="overview" className="flex-1 flex flex-col">
                    <OverviewReport />
                </TabsContent>
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
