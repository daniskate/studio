
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { ExpenseForm } from '@/components/expenses/ExpenseForm';
import { SpendingChart } from '@/components/reports/SpendingChart';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  Users, 
  ArrowRightLeft,
  Plus,
  Trash2,
  Edit2,
  Receipt,
  PieChart as PieIcon,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO, compareDesc } from 'date-fns';
import { it } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const USERS = [
  { id: 'u1', name: 'Marco' },
  { id: 'u2', name: 'Sara' }
];

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  paidBy: string;
  splitType: 'split' | 'personal' | 'for_other';
}

const INITIAL_EXPENSES: Expense[] = [
  { 
    id: '1',
    description: 'Cena Pizzeria', 
    amount: 40.00, 
    category: 'Svago & Ristoranti', 
    date: new Date().toISOString(),
    paidBy: 'u1',
    splitType: 'split'
  },
  { 
    id: '2',
    description: 'Spesa Esselunga', 
    amount: 60.50, 
    category: 'Spesa Alimentare', 
    date: new Date(Date.now() - 86400000).toISOString(),
    paidBy: 'u2',
    splitType: 'split'
  },
];

export default function SpeseJournal() {
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showCharts, setShowCharts] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  const addExpense = (newExpense: any) => {
    if (editingExpense) {
      setExpenses(prev => prev.map(e => e.id === editingExpense.id ? { ...newExpense, id: e.id } : e));
      setEditingExpense(null);
    } else {
      setExpenses(prev => [{ ...newExpense, id: Math.random().toString(36).substr(2, 9) }, ...prev]);
    }
    setIsFormOpen(false);
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
    toast({
      title: "Spesa eliminata",
      description: "La transazione è stata rimossa correttamente.",
    });
  };

  const startEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setIsFormOpen(true);
  };

  // Ordinamento per data decrescente
  const sortedExpenses = useMemo(() => {
    return [...expenses].sort((a, b) => compareDesc(parseISO(a.date), parseISO(b.date)));
  }, [expenses]);

  // Calcolo Bilancio (Tricount Style)
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
    });

    const diff = u2OwesU1 - u1OwesU2;
    return {
      diff,
      u1OwesU2: diff < 0 ? Math.abs(diff) : 0,
      u2OwesU1: diff > 0 ? diff : 0
    };
  }, [expenses]);

  // Dati per i grafici
  const categoryData = useMemo(() => {
    const data: Record<string, number> = {};
    expenses.forEach(exp => {
      data[exp.category] = (data[exp.category] || 0) + exp.amount;
    });
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [expenses]);

  const personalVsSharedData = useMemo(() => {
    let marcoTotal = 0;
    let saraTotal = 0;
    let sharedTotal = 0;

    expenses.forEach(exp => {
      if (exp.splitType === 'personal') {
        if (exp.paidBy === 'u1') marcoTotal += exp.amount;
        else saraTotal += exp.amount;
      } else {
        sharedTotal += exp.amount;
      }
    });

    return [
      { name: 'Pers. Marco', value: marcoTotal },
      { name: 'Pers. Sara', value: saraTotal },
      { name: 'Comuni', value: sharedTotal }
    ].filter(d => d.value > 0);
  }, [expenses]);

  const totalSpent = useMemo(() => expenses.reduce((acc, curr) => acc + curr.amount, 0), [expenses]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 max-w-2xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary rounded text-white">
              <Users className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-primary">NoiDue</h1>
          </div>
          
          <Dialog open={isFormOpen} onOpenChange={(open) => {
            setIsFormOpen(open);
            if (!open) setEditingExpense(null);
          }}>
            <DialogTrigger asChild>
              <Button size="icon" className="rounded-full w-10 h-10 shadow-lg">
                <Plus className="w-6 h-6" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{editingExpense ? 'Modifica Spesa' : 'Nuova Spesa'}</DialogTitle>
              </DialogHeader>
              <ExpenseForm 
                onAdd={addExpense} 
                initialData={editingExpense} 
              />
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="container max-w-2xl mx-auto p-4 space-y-6">
        {/* Card Bilancio */}
        <Card className={`border-none shadow-xl transition-colors duration-500 overflow-hidden ${
          balances.diff === 0 ? 'bg-primary' : 
          balances.u2OwesU1 > 0 ? 'bg-emerald-500' : 'bg-rose-500'
        }`}>
          <CardContent className="p-6 text-white">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wider opacity-80">Bilancio Attuale</p>
                <h2 className="text-2xl font-bold">
                  {balances.diff === 0 ? "Siete in pari!" : 
                   balances.u2OwesU1 > 0 ? `Sara deve a Marco €${balances.u2OwesU1.toFixed(2)}` : 
                   `Marco deve a Sara €${balances.u1OwesU2.toFixed(2)}`}
                </h2>
              </div>
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                <ArrowRightLeft className="w-8 h-8" />
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-white/20 flex justify-between items-center">
              <span className="text-sm opacity-90">Spesa totale combinata:</span>
              <span className="text-xl font-bold">€{totalSpent.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Grafici Collassabili */}
        <Collapsible
          open={showCharts}
          onOpenChange={setShowCharts}
          className="space-y-2"
        >
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <PieIcon className="w-4 h-4" /> Analisi Spese
            </h3>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                {showCharts ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="space-y-4">
            <SpendingChart data={categoryData} />
            <Card className="border-none shadow-md overflow-hidden bg-accent/30">
              <CardHeader className="py-3">
                <CardTitle className="text-sm font-bold text-primary uppercase tracking-tight">Ripartizione Personale vs Comuni</CardTitle>
              </CardHeader>
              <CardContent className="p-2 h-[250px]">
                <SpendingChart data={personalVsSharedData} />
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>

        {/* Registro Spese */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold flex items-center gap-2 px-1">
            <Receipt className="w-5 h-5 text-primary" /> Registro Transazioni
          </h3>
          
          <div className="space-y-6">
            {sortedExpenses.length > 0 ? (
              sortedExpenses.map((exp, index) => {
                const currentDate = parseISO(exp.date);
                const showMonthHeader = index === 0 || 
                  format(parseISO(sortedExpenses[index-1].date), 'MMMM', { locale: it }) !== format(currentDate, 'MMMM', { locale: it });

                return (
                  <div key={exp.id} className="space-y-3">
                    {showMonthHeader && (
                      <div className="sticky top-20 z-10 py-1 px-4 bg-muted/90 backdrop-blur-sm rounded-full inline-block text-xs font-bold uppercase tracking-widest text-muted-foreground shadow-sm">
                        {format(currentDate, 'MMMM yyyy', { locale: it })}
                      </div>
                    )}
                    
                    <Card className="group border-none shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer">
                      <CardContent className="p-4 flex justify-between items-center gap-3">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold shrink-0 ${
                            exp.paidBy === 'u1' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'
                          }`}>
                            {USERS.find(u => u.id === exp.paidBy)?.name[0]}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-foreground truncate">{exp.description}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-muted-foreground font-medium">
                                {format(parseISO(exp.date), 'dd MMM', { locale: it })}
                              </span>
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-muted-foreground/20 text-muted-foreground">
                                {exp.splitType === 'split' ? '50/50' : exp.splitType === 'personal' ? 'Pers.' : 'Per altro'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="font-bold text-lg">€{exp.amount.toFixed(2)}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {USERS.find(u => u.id === exp.paidBy)?.name}
                            </p>
                          </div>
                          
                          <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => startEdit(exp)}>
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => deleteExpense(exp.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-20 text-muted-foreground">
                <Receipt className="w-12 h-12 opacity-20 mx-auto mb-4" />
                <p>Nessuna spesa registrata ancora.</p>
                <Button variant="link" onClick={() => setIsFormOpen(true)}>Inizia ora</Button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Toaster />
    </div>
  );
}
