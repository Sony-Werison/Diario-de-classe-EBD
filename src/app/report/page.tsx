
"use client";

import React, { useState } from 'react';
import { MonthlyReport } from "@/components/monthly-report";
import { MonthlyStudentReport } from '@/components/monthly-student-report';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, User, LayoutDashboard } from 'lucide-react';
import { OverviewReport } from '@/components/overview-report';
import { cn } from '@/lib/utils';

export default function ReportPage() {
    const [activeTab, setActiveTab] = useState("overview");

    return (
        <div className="p-4 sm:p-6 text-white bg-background flex-1 flex flex-col pb-20 sm:pb-6">
            <header className="mb-4">
                <h1 className="text-2xl font-bold">Relatórios</h1>
                <p className="text-slate-400">Analise o desempenho da turma ou de alunos individuais.</p>
            </header>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                <TabsList className="grid grid-cols-3 gap-1 bg-transparent p-0 mb-4 h-auto">
                     <TabsTrigger value="overview" className={cn("gap-2 justify-center py-2", activeTab === 'overview' && "bg-primary/10 border-primary/50 text-primary")}>
                        <LayoutDashboard size={16} /> Visão Geral
                    </TabsTrigger>
                    <TabsTrigger value="monthly" className={cn("gap-2 justify-center py-2", activeTab === 'monthly' && "bg-primary/10 border-primary/50 text-primary")}>
                        <Users size={16} /> Por Turma
                    </TabsTrigger>
                    <TabsTrigger value="individual" className={cn("gap-2 justify-center py-2", activeTab === 'individual' && "bg-primary/10 border-primary/50 text-primary")}>
                        <User size={16} /> Individual
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
