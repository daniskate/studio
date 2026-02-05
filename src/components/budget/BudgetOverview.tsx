"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Target } from 'lucide-react';

interface BudgetOverviewProps {
  budgets: { category: string; limit: number; spent: number }[];
}

export function BudgetOverview({ budgets }: BudgetOverviewProps) {
  const totalLimit = budgets.reduce((acc, b) => acc + b.limit, 0);
  const totalSpent = budgets.reduce((acc, b) => acc + b.spent, 0);
  const overallProgress = totalLimit > 0 ? (totalSpent / totalLimit) * 100 : 0;

  return (
    <Card className="shadow-lg h-full overflow-hidden border-none">
      <CardHeader className="bg-primary/5">
        <CardTitle className="flex items-center gap-2 text-primary text-lg">
          <Target className="w-5 h-5" /> Obiettivi di Spesa
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-sm text-muted-foreground">Budget Totale Utilizzato</p>
              <p className="text-2xl font-bold text-primary">€{totalSpent.toFixed(0)} / €{totalLimit.toFixed(0)}</p>
            </div>
            <span className="text-xs font-semibold px-2 py-1 rounded bg-accent text-primary">
              {overallProgress.toFixed(1)}%
            </span>
          </div>
          <Progress value={overallProgress} className="h-3" />
        </div>

        <div className="space-y-4">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Dettaglio Categorie</p>
          {budgets.slice(0, 4).map((b) => (
            <div key={b.category} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>{b.category}</span>
                <span className="font-medium">€{b.spent} di €{b.limit}</span>
              </div>
              <Progress 
                value={(b.spent / b.limit) * 100} 
                className="h-1.5" 
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
