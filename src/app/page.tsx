"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { ExpenseForm } from '@/components/expenses/ExpenseForm';
import { SpendingChart } from '@/components/reports/SpendingChart';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Users, 
  ArrowRightLeft,
  Plus,
  Trash2,
  Edit2,
  Receipt,
  PieChart as PieIcon,
  ChevronDown,
  ChevronUp,
  Settings,
  LayoutDashboard,
  Download,
  Share2,
  UserEdit,
  Save
} from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO, compareDesc } from 'date-fns';
import { it } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

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
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Settings State
  const [groupName, setGroupName] = useState('NoiDue');
  const [user1Name, setUser1Name] = useState('Marco');
  const [user2Name, setUser2Name] = useState('Sara');

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

  const exportToCSV = () => {
    const headers = ["Data", "Descrizione", "Importo", "Categoria", "Pagato da", "Tipo Divisione"];
    const rows = expenses.map(e => [
      format(parseISO(e.date), 'yyyy-MM-dd'),
      e.description,
      e.amount.toString(),
      e.category,
      e.paidBy === 'u1' ? user1Name : user2Name,
      e.splitType
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `spese_${groupName.toLowerCase()}_${format(new Date(), 'yyyyMMdd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "CSV Esportato",
      description: "Il file è stato scaricato correttamente.",
    });
  };

  const copyShareLink = () => {
    const dummyLink = `https://noidue-app.web.app/join/${Math.random().toString(36).substr(2, 6)}`;
    navigator.clipboard.writeText(dummyLink);
    toast({
      title: "Link Copiato!",
      description: "Invia questo link all'altra persona per condividere le spese.",
    });
  };

  const sortedExpenses = useMemo(() => {
    return [...expenses].sort((a, b) => compareDesc(parseISO(a.date), parseISO(b.date)));
  }, [expenses]);

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

  const categoryData = useMemo(() => {
    const data: Record<string, number> = {};
    expenses.forEach(exp => {
      data[exp.category] = (data[exp.category] || 0) + exp.amount;
    });
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [expenses]);

  const personalVsSharedData = useMemo(() => {
    let u1Total = 0;
    let u2Total = 0;
    let sharedTotal = 0;

    expenses.forEach(exp => {
      if (exp.splitType === 'personal') {
        if (exp.paidBy === 'u1') u1Total += exp.amount;
        else u2Total += exp.amount;
      } else {
        sharedTotal += exp.amount;
      }
    });

    const data = [];
    if (u1Total > 0) data.push({ name: `Pers. ${user1Name}`, value: u1Total });
    if (u2Total > 0) data.push({ name: `Pers. ${user2Name}`, value: u2Total });
    if (sharedTotal > 0) data.push({ name: 'Comuni', value: sharedTotal });
    
    return data;
  }, [expenses, user1Name, user2Name]);

  const totalSharedSpent = useMemo(() => 
    expenses
      .filter(e => e.splitType !== 'personal')
      .reduce((acc, curr) => acc + curr.amount, 0), 
    [expenses]
  );

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 max-w-2xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary rounded text-white">
              <Users className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-primary">{groupName}</h1>
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
                user1Name={user1Name}
                user2Name={user2Name}
              />
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="container max-w-2xl mx-auto p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsContent value="dashboard" className="space-y-6 m-0">
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
                       balances.u2OwesU1 > 0 ? `${user2Name} deve a ${user1Name} €${balances.u2OwesU1.toFixed(2)}` : 
                       `${user1Name} deve a ${user2Name} €${balances.u1OwesU2.toFixed(2)}`}
                    </h2>
                  </div>
                  <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                    <ArrowRightLeft className="w-8 h-8" />
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-white/20 flex justify-between items-center">
                  <span className="text-sm opacity-90">Totale spese comuni:</span>
                  <span className="text-xl font-bold">€{totalSharedSpent.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            <Collapsible open={showCharts} onOpenChange={setShowCharts} className="space-y-2">
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
              <CollapsibleContent className="space-y-6 pt-2">
                <div className="space-y-4">
                  <SpendingChart data={categoryData} />
                  {personalVsSharedData.length > 0 && (
                    <div className="pt-2">
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 px-1">Ripartizione Personale vs Comuni</h4>
                      <SpendingChart data={personalVsSharedData} />
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>

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
                                {(exp.paidBy === 'u1' ? user1Name : user2Name)[0]}
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
                                  {exp.paidBy === 'u1' ? user1Name : user2Name}
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
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6 m-0">
            <h2 className="text-2xl font-bold px-1">Impostazioni</h2>
            
            <Card className="border-none shadow-md">
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label>Nome del Gruppo</Label>
                  <Input value={groupName} onChange={(e) => setGroupName(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Persona 1</Label>
                    <Input value={user1Name} onChange={(e) => setUser1Name(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Persona 2</Label>
                    <Input value={user2Name} onChange={(e) => setUser2Name(e.target.value)} />
                  </div>
                </div>
                <Button className="w-full gap-2 mt-2" onClick={() => toast({ title: "Modifiche salvate", description: "I nomi sono stati aggiornati correttamente." })}>
                  <Save className="w-4 h-4" /> Salva Nomi
                </Button>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-bold">Azioni</h3>
                <div className="grid grid-cols-1 gap-3">
                  <Button variant="outline" className="justify-start gap-3 h-12" onClick={copyShareLink}>
                    <Share2 className="w-5 h-5 text-primary" />
                    Condividi accesso al gruppo
                  </Button>
                  <Button variant="outline" className="justify-start gap-3 h-12" onClick={exportToCSV}>
                    <Download className="w-5 h-5 text-primary" />
                    Esporta tutte le spese (CSV)
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <div className="text-center pt-8 opacity-40">
              <p className="text-xs">NoiDue v1.0.0</p>
              <p className="text-[10px]">Smart Shared Expenses</p>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Navigation Bar for Android Style */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-t px-6 h-16 flex items-center justify-around max-w-2xl mx-auto">
        <Button 
          variant="ghost" 
          className={`flex flex-col items-center gap-1 h-auto p-2 min-w-[70px] ${activeTab === 'dashboard' ? 'text-primary' : 'text-muted-foreground'}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <LayoutDashboard className="w-6 h-6" />
          <span className="text-[10px] font-bold">Dashboard</span>
        </Button>
        <Button 
          variant="ghost" 
          className={`flex flex-col items-center gap-1 h-auto p-2 min-w-[70px] ${activeTab === 'settings' ? 'text-primary' : 'text-muted-foreground'}`}
          onClick={() => setActiveTab('settings')}
        >
          <Settings className="w-6 h-6" />
          <span className="text-[10px] font-bold">Impostazioni</span>
        </Button>
      </nav>

      <Toaster />
    </div>
  );
}
