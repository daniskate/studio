"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { ExpenseForm } from '@/components/expenses/ExpenseForm';
import { BudgetOverview } from '@/components/budget/BudgetOverview';
import { SpendingChart } from '@/components/reports/SpendingChart';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  Wallet, 
  PieChart, 
  LayoutDashboard, 
  Settings, 
  Users, 
  LogOut, 
  Menu,
  TrendingUp,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRightLeft,
  User
} from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const USERS = [
  { id: 'u1', name: 'Marco' },
  { id: 'u2', name: 'Sara' }
];

const INITIAL_EXPENSES = [
  { 
    description: 'Cena Pizzeria', 
    amount: 40.00, 
    category: 'Svago & Ristoranti', 
    date: new Date().toISOString(),
    paidBy: 'u1',
    splitType: 'split' // 'split', 'personal', 'for_other'
  },
  { 
    description: 'Spesa Esselunga', 
    amount: 60.50, 
    category: 'Spesa Alimentare', 
    date: new Date(Date.now() - 86400000).toISOString(),
    paidBy: 'u2',
    splitType: 'split'
  },
];

export default function SpeseJournal() {
  const [expenses, setExpenses] = useState(INITIAL_EXPENSES);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const addExpense = (newExpense: any) => {
    setExpenses(prev => [newExpense, ...prev]);
  };

  // Calcolo Bilancio (Chi deve a chi)
  const balances = useMemo(() => {
    let u1OwesU2 = 0;
    let u2OwesU1 = 0;

    expenses.forEach(exp => {
      if (exp.splitType === 'split') {
        const half = exp.amount / 2;
        if (exp.paidBy === 'u1') u2OwesU1 += half;
        else u1OwesU2 += half;
      } else if (exp.splitType === 'for_other') {
        if (exp.paidBy === 'u1') u2OwesU1 += exp.amount;
        else u1OwesU2 += exp.amount;
      }
      // 'personal' non influisce sul debito
    });

    const diff = u2OwesU1 - u1OwesU2;
    return {
      diff,
      u1OwesU2: diff < 0 ? Math.abs(diff) : 0,
      u2OwesU1: diff > 0 ? diff : 0
    };
  }, [expenses]);

  const chartData = useMemo(() => {
    const counts: Record<string, number> = {};
    expenses.forEach(e => {
      counts[e.category] = (counts[e.category] || 0) + e.amount;
    });
    return Object.entries(counts).map(([name, value]) => ({ 
      name, 
      value: parseFloat(value.toFixed(2)) 
    }));
  }, [expenses]);

  const totalSpentMonth = useMemo(() => expenses.reduce((acc, curr) => acc + curr.amount, 0), [expenses]);

  if (!mounted) return null;

  const SidebarContent = () => (
    <div className="flex flex-col h-full py-6 px-4 space-y-8">
      <div className="flex items-center gap-2 px-2">
        <div className="p-2 bg-primary rounded-lg text-white">
          <Users className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-primary">NoiDue Spese</h1>
      </div>
      
      <nav className="flex-1 space-y-2">
        <button className="flex items-center gap-3 w-full px-4 py-3 rounded-lg bg-primary/10 text-primary font-semibold">
          <LayoutDashboard className="w-5 h-5" /> Dashboard
        </button>
        <button className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted transition-colors text-left">
          <ArrowRightLeft className="w-5 h-5" /> Bilancio Gruppo
        </button>
        <button className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted transition-colors text-left">
          <PieChart className="w-5 h-5" /> Statistiche
        </button>
        <button className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted transition-colors text-left">
          <Settings className="w-5 h-5" /> Impostazioni
        </button>
      </nav>

      <div className="pt-8 border-t px-2">
        <button className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-destructive hover:bg-destructive/5 transition-colors text-left">
          <LogOut className="w-5 h-5" /> Esci
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      <aside className="w-64 border-r bg-card hidden md:block sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-6">
        <header className="md:hidden flex justify-between items-center pb-4 border-b">
          <div className="flex items-center gap-2">
             <div className="p-1.5 bg-primary rounded text-white">
               <Users className="w-5 h-5" />
             </div>
             <h1 className="text-lg font-bold text-primary">NoiDue</h1>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <SidebarContent />
            </SheetContent>
          </Sheet>
        </header>

        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold text-foreground">Ciao, Team</h2>
          <p className="text-muted-foreground">Ecco come vanno le vostre spese condivise.</p>
        </div>

        {/* Sezione Bilancio Tricount Style */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className={`col-span-1 md:col-span-2 border-none shadow-lg ${balances.u2OwesU1 > 0 ? 'bg-green-50' : balances.u1OwesU2 > 0 ? 'bg-red-50' : 'bg-primary'}`}>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
                <div>
                  <p className="text-sm font-medium opacity-70">Bilancio di Gruppo</p>
                  <h3 className="text-3xl font-bold">
                    {balances.diff === 0 ? "Siete in pari!" : 
                     balances.u2OwesU1 > 0 ? `Sara deve a Marco €${balances.u2OwesU1.toFixed(2)}` : 
                     `Marco deve a Sara €${balances.u1OwesU2.toFixed(2)}`}
                  </h3>
                </div>
                <div className="p-4 bg-white/20 rounded-full">
                  <ArrowRightLeft className="w-8 h-8 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-md border-none flex flex-col justify-center">
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-sm font-medium">Totale Speso</p>
              <p className="text-3xl font-bold text-foreground">€{totalSpentMonth.toFixed(2)}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5">
            <ExpenseForm onAdd={addExpense} />
          </div>
          <div className="lg:col-span-7">
            <Card className="shadow-lg border-none h-full">
               <CardHeader className="border-b pb-4">
                 <CardTitle className="text-lg font-bold flex items-center gap-2">
                   <TrendingUp className="w-5 h-5 text-primary" /> Spese per Persona
                 </CardTitle>
               </CardHeader>
               <CardContent className="pt-6">
                  <div className="space-y-6">
                    {USERS.map(user => {
                      const userTotal = expenses.filter(e => e.paidBy === user.id).reduce((a, b) => a + b.amount, 0);
                      const progress = totalSpentMonth > 0 ? (userTotal / totalSpentMonth) * 100 : 0;
                      return (
                        <div key={user.id} className="space-y-2">
                           <div className="flex justify-between items-center">
                             <div className="flex items-center gap-2">
                               <User className="w-4 h-4 text-primary" />
                               <span className="font-bold">{user.name}</span>
                             </div>
                             <span className="font-bold text-primary">€{userTotal.toFixed(2)}</span>
                           </div>
                           <div className="w-full bg-muted rounded-full h-3">
                              <div 
                                className="bg-primary h-3 rounded-full transition-all duration-500" 
                                style={{ width: `${progress}%` }}
                              ></div>
                           </div>
                        </div>
                      );
                    })}
                  </div>
               </CardContent>
            </Card>
          </div>
        </div>

        <section className="space-y-4">
          <h3 className="text-xl font-bold text-foreground">Distribuzione Categorie</h3>
          <SpendingChart data={chartData} />
        </section>

        <Card className="shadow-lg border-none">
          <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
            <CardTitle className="text-foreground text-lg flex items-center gap-2 font-bold">
              <CreditCard className="w-5 h-5 text-primary" /> Ultime Transazioni
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 p-0">
            <div className="divide-y">
              {expenses.length > 0 ? (
                expenses.slice(0, 10).map((exp, i) => (
                  <div key={i} className="flex justify-between items-center p-4 hover:bg-accent/30 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-foreground">{exp.description}</p>
                        <div className="flex gap-2 items-center">
                          <p className="text-xs text-muted-foreground">{USERS.find(u => u.id === exp.paidBy)?.name} ha pagato</p>
                          <Badge variant="outline" className="text-[10px] py-0">
                            {exp.splitType === 'split' ? 'Divisa' : exp.splitType === 'personal' ? 'Personale' : 'Per l\'altro'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">€{exp.amount.toFixed(2)}</p>
                      <p className="text-[10px] text-muted-foreground">{new Date(exp.date).toLocaleDateString('it-IT')}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-muted-foreground">Nessuna spesa registrata.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
      <Toaster />
    </div>
  );
}
