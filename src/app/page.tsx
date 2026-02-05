"use client";

import React, { useState, useMemo } from 'react';
import { ExpenseForm } from '@/components/expenses/ExpenseForm';
import { BudgetOverview } from '@/components/budget/BudgetOverview';
import { SpendingChart } from '@/components/reports/SpendingChart';
import { SubscriptionList } from '@/components/subscriptions/SubscriptionList';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Wallet, PieChart, LayoutDashboard, Settings, ListTodo, LogOut } from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';
import { Separator } from '@/components/ui/separator';

const INITIAL_EXPENSES = [
  { description: 'Netflix Subscription', amount: 15.99, category: 'Subscriptions', date: '2023-11-20' },
  { description: 'Groceries at Walmart', amount: 85.50, category: 'Food & Dining', date: '2023-11-19' },
  { description: 'Uber Ride', amount: 22.00, category: 'Transportation', date: '2023-11-18' },
];

const INITIAL_BUDGETS = [
  { category: 'Food & Dining', limit: 500, spent: 320 },
  { category: 'Transportation', limit: 200, spent: 140 },
  { category: 'Entertainment', limit: 150, spent: 90 },
  { category: 'Shopping', limit: 300, spent: 210 },
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
    // Update local budget spent amount for demo purposes
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

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar - Desktop Only */}
      <aside className="w-64 border-r bg-white hidden md:flex flex-col p-6 space-y-8 sticky top-0 h-screen">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary rounded-lg text-white">
            <Wallet className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-primary font-headline">SpeseJournal</h1>
        </div>
        
        <nav className="flex-1 space-y-2">
          <button className="flex items-center gap-3 w-full px-4 py-3 rounded-lg bg-accent text-secondary font-semibold">
            <LayoutDashboard className="w-5 h-5" /> Dashboard
          </button>
          <button className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted transition-colors">
            <ListTodo className="w-5 h-5" /> Transactions
          </button>
          <button className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted transition-colors">
            <PieChart className="w-5 h-5" /> Reports
          </button>
          <button className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted transition-colors">
            <Settings className="w-5 h-5" /> Settings
          </button>
        </nav>

        <div className="pt-8 border-t">
          <button className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-destructive hover:bg-destructive/5 transition-colors">
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Header Mobile */}
        <header className="md:hidden flex justify-between items-center pb-4">
          <div className="flex items-center gap-2">
             <div className="p-1.5 bg-primary rounded text-white">
               <Wallet className="w-5 h-5" />
             </div>
             <h1 className="text-lg font-bold text-primary font-headline">SpeseJournal</h1>
          </div>
          <button className="p-2 bg-muted rounded-full"><Settings className="w-5 h-5" /></button>
        </header>

        {/* Dashboard Welcome */}
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-bold text-foreground">Welcome back, Marco</h2>
          <p className="text-muted-foreground">Manage your daily expenses and reach your financial goals.</p>
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
            <h3 className="text-xl font-bold text-foreground font-headline">Monthly Spending Analysis</h3>
            <span className="text-sm text-secondary font-semibold hover:underline cursor-pointer">View Detailed Report</span>
          </div>
          <SpendingChart data={chartData} />
        </section>

        {/* Bottom Section: Subscriptions & Transactions */}
        <div className="grid lg:grid-cols-2 gap-6">
          <SubscriptionList subscriptions={INITIAL_SUBSCRIPTIONS} />
          
          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-primary text-lg flex items-center gap-2">
                <ListTodo className="w-5 h-5" /> Recent Activity
              </CardTitle>
              <span className="text-xs text-muted-foreground">Last 7 days</span>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {expenses.slice(0, 5).map((exp, i) => (
                  <div key={i} className="flex justify-between items-center p-2 hover:bg-muted/50 rounded transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-secondary">
                        <span className="font-bold text-xs">{exp.category[0]}</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{exp.description}</p>
                        <p className="text-xs text-muted-foreground">{new Date(exp.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <p className="font-bold text-primary">-${exp.amount.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Toaster />
    </div>
  );
}
