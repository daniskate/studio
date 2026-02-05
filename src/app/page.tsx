
"use client";

import React, { useState, useMemo } from 'react';
import { ExpenseForm } from '@/components/expenses/ExpenseForm';
import { BudgetOverview } from '@/components/budget/BudgetOverview';
import { SpendingChart } from '@/components/reports/SpendingChart';
import { SubscriptionList } from '@/components/subscriptions/SubscriptionList';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  Wallet, 
  PieChart, 
  LayoutDashboard, 
  Settings, 
  ListTodo, 
  LogOut, 
  Menu,
  TrendingUp,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

const INITIAL_EXPENSES = [
  { description: 'Abbonamento Netflix', amount: 15.99, category: 'Subscriptions', date: new Date().toISOString() },
  { description: 'Spesa al supermercato', amount: 85.50, category: 'Food & Dining', date: new Date(Date.now() - 86400000).toISOString() },
  { description: 'Corsa Uber', amount: 22.00, category: 'Transportation', date: new Date(Date.now() - 172800000).toISOString() },
  { description: 'Cena fuori', amount: 45.00, category: 'Food & Dining', date: new Date(Date.now() - 259200000).toISOString() },
];

const INITIAL_BUDGETS = [
  { category: 'Food & Dining', limit: 500, spent: 130.50 },
  { category: 'Transportation', limit: 200, spent: 22.00 },
  { category: 'Entertainment', limit: 150, spent: 0 },
  { category: 'Shopping', limit: 300, spent: 0 },
];

const INITIAL_SUBSCRIPTIONS = [
  { id: '1', name: 'Netflix', amount: 15.99, renewalDate: '2023-12-15' },
  { id: '2', name: 'Spotify', amount: 9.99, renewalDate: '2023-12-01' },
  { id: '3', name: 'iCloud+', amount: 0.99, renewalDate: '2023-12-25' },
];

export default function SpeseJournal() {
  const [expenses, setExpenses] = useState(INITIAL_EXPENSES);
  const [budgets, setBudgets] = useState(INITIAL_BUDGETS);
  
  const addExpense = (newExpense: any) => {
    setExpenses([newExpense, ...expenses]);
    setBudgets(prev => prev.map(b => 
      b.category === newExpense.category 
        ? { ...b, spent: b.spent + newExpense.amount } 
        : b
    ));
  };

  const chartData = useMemo(() => {
    const counts: Record<string, number> = {};
    expenses.forEach(e => {
      counts[e.category] = (counts[e.category] || 0) + e.amount;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value: Math.round(value) }));
  }, [expenses]);

  const totalSpentMonth = useMemo(() => expenses.reduce((acc, curr) => acc + curr.amount, 0), [expenses]);
  const dailyAverage = (totalSpentMonth / 30).toFixed(2);

  const SidebarContent = () => (
    <div className="flex flex-col h-full py-6 px-4 space-y-8">
      <div className="flex items-center gap-2 px-2">
        <div className="p-2 bg-primary rounded-lg text-white">
          <Wallet className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-primary font-headline">SpeseJournal</h1>
      </div>
      
      <nav className="flex-1 space-y-2">
        <button className="flex items-center gap-3 w-full px-4 py-3 rounded-lg bg-accent text-secondary font-semibold">
          <LayoutDashboard className="w-5 h-5" /> Dashboard
        </button>
        <button className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted transition-colors text-left">
          <ListTodo className="w-5 h-5" /> Transazioni
        </button>
        <button className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted transition-colors text-left">
          <PieChart className="w-5 h-5" /> Report
        </button>
        <button className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted transition-colors text-left">
          <Settings className="w-5 h-5" /> Impostazioni
        </button>
      </nav>

      <div className="pt-8 border-t px-2">
        <button className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-destructive hover:bg-destructive/5 transition-colors text-left">
          <LogOut className="w-5 h-5" /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar - Desktop */}
      <aside className="w-64 border-r bg-card hidden md:block sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Header Mobile */}
        <header className="md:hidden flex justify-between items-center pb-4 border-b">
          <div className="flex items-center gap-2">
             <div className="p-1.5 bg-primary rounded text-white">
               <Wallet className="w-5 h-5" />
             </div>
             <h1 className="text-lg font-bold text-primary font-headline">SpeseJournal</h1>
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

        {/* Dashboard Welcome */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Ciao, Marco</h2>
            <p className="text-muted-foreground">Ecco un riepilogo delle tue finanze oggi.</p>
          </div>
          <div className="flex gap-2">
             <Button variant="outline" className="hidden sm:flex gap-2">
               <TrendingUp className="w-4 h-4" /> Export Report
             </Button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-primary-foreground/70 text-sm font-medium">Spese Totali Mese</p>
                  <p className="text-2xl font-bold">€{totalSpentMonth.toFixed(2)}</p>
                </div>
                <div className="p-2 bg-white/20 rounded-lg">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs">
                <span className="flex items-center text-green-300">
                  <ArrowDownRight className="w-3 h-3" /> 12%
                </span>
                <span className="opacity-70">rispetto al mese scorso</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Media Giornaliera</p>
                  <p className="text-2xl font-bold">€{dailyAverage}</p>
                </div>
                <div className="p-2 bg-accent rounded-lg text-secondary">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs">
                <span className="flex items-center text-primary font-semibold">
                  <ArrowUpRight className="w-3 h-3" /> €5.20
                </span>
                <span className="text-muted-foreground">sopra la media</span>
              </div>
            </CardContent>
          </Card>

          {/* Budget Quick Indicator */}
          <Card className="hidden lg:block lg:col-span-2 overflow-hidden relative">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold text-primary">Obiettivo Risparmio</h4>
                <span className="text-xs font-bold px-2 py-1 bg-green-100 text-green-700 rounded-full">Sulla buona strada</span>
              </div>
              <div className="space-y-2">
                 <div className="flex justify-between text-sm">
                   <span className="text-muted-foreground font-medium">Messo da parte: €1.250</span>
                   <span className="font-bold">83%</span>
                 </div>
                 <div className="w-full bg-muted rounded-full h-2">
                   <div className="bg-green-500 h-2 rounded-full w-[83%]"></div>
                 </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Grid: Expense Form & Budget Progress */}
        <div className="grid lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-4">
            <ExpenseForm onAdd={addExpense} />
          </div>
          <div className="lg:col-span-8">
            <BudgetOverview budgets={budgets} />
          </div>
        </div>

        {/* Middle Section: Reports */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-foreground font-headline">Analisi Spese Mensili</h3>
            <span className="text-sm text-secondary font-semibold hover:underline cursor-pointer">Dettagli Completi</span>
          </div>
          <SpendingChart data={chartData} />
        </section>

        {/* Bottom Section: Subscriptions & Transactions */}
        <div className="grid lg:grid-cols-2 gap-6">
          <SubscriptionList subscriptions={INITIAL_SUBSCRIPTIONS} />
          
          <Card className="shadow-lg border-none">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-primary text-lg flex items-center gap-2">
                <ListTodo className="w-5 h-5" /> Attività Recente
              </CardTitle>
              <span className="text-xs text-muted-foreground">Ultimi 7 giorni</span>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {expenses.length > 0 ? (
                  expenses.slice(0, 5).map((exp, i) => (
                    <div key={i} className="flex justify-between items-center p-3 hover:bg-muted/50 rounded-xl transition-all group border border-transparent hover:border-muted cursor-default">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-secondary">
                          <span className="font-bold text-sm uppercase">{exp.category[0]}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{exp.description}</p>
                          <p className="text-xs text-muted-foreground">{new Date(exp.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <p className="font-bold text-primary">-€{exp.amount.toFixed(2)}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-muted-foreground">Nessuna transazione trovata.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Toaster />
    </div>
  );
}
