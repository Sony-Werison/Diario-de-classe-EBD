

"use client";

import React, { useState } from 'react';
import { MonthlyReport } from "@/components/monthly-report";
import { MonthlyStudentReport } from '@/components/monthly-student-report';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, User, LayoutDashboard } from 'lucide-react';
import { OverviewReport } from '@/components/overview-report';
import { cn } from '@/lib/utils';

export default function ReportPage() {
    const [activeTab, setActiveTab] = useState("monthly");

    return (
        <div className="p-4 sm:p-6 text-white bg-background flex-1 flex flex-col">
            <header className="mb-6">
                <h1 className="text-2xl font-bold">Relatórios</h1>
                <p className="text-slate-400">Analise o desempenho da turma ou de alunos individuais.</p>
            </header>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                <TabsList className="flex flex-wrap h-auto justify-start sm:justify-start sm:w-auto bg-transparent p-0 gap-2 mb-4">
                     <TabsTrigger value="monthly" className={cn("gap-2 w-full sm:w-auto justify-center sm:justify-start", activeTab === 'monthly' && "bg-primary/10 border-primary/50 text-primary")}>
                        <Users size={16} /> Relatório Mensal
                    </TabsTrigger>
                    <TabsTrigger value="individual" className={cn("gap-2 w-full sm:w-auto justify-center sm:justify-start", activeTab === 'individual' && "bg-primary/10 border-primary/50 text-primary")}>
                        <User size={16} /> Relatório Individual
                    </TabsTrigger>
                    <TabsTrigger value="overview" className={cn("gap-2 w-full sm:w-auto justify-center sm:justify-start", activeTab === 'overview' && "bg-primary/10 border-primary/50 text-primary")}>
                        <LayoutDashboard size={16} /> Visão Geral
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
