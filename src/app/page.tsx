
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { ExpenseForm } from '@/components/expenses/ExpenseForm';
import { SpendingChart } from '@/components/reports/SpendingChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  ArrowRightLeft,
  Plus,
  Trash2,
  Edit2,
  Receipt,
  PieChart as PieIcon,
  Settings,
  LayoutDashboard,
  Download,
  Share2,
  Save,
  User,
  PlusCircle,
  Check
} from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO, compareDesc } from 'date-fns';
import { it } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { INITIAL_CATEGORIES, Category, AVAILABLE_ICONS, IconName } from '@/app/lib/categories';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface Expense {
  id: string;
  description: string;
  amount: number;
  categoryId: string;
  date: string;
  paidBy: string;
  splitType: 'split' | 'personal' | 'for_other';
}

const INITIAL_EXPENSES: Expense[] = [
  { 
    id: '1',
    description: 'Cena Pizzeria', 
    amount: 40.00, 
    categoryId: 'cat2', 
    date: new Date().toISOString(),
    paidBy: 'u1',
    splitType: 'split'
  },
  { 
    id: '2',
    description: 'Spesa Esselunga', 
    amount: 60.50, 
    categoryId: 'cat1', 
    date: new Date(Date.now() - 86400000).toISOString(),
    paidBy: 'u2',
    splitType: 'split'
  },
];

export default function SpeseJournal() {
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Settings State
  const [groupName, setGroupName] = useState('NoiDue');
  const [user1Name, setUser1Name] = useState('Marco');
  const [user2Name, setUser2Name] = useState('Sara');

  // New Category State
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState<IconName>('Layers');
  const [newCatColor, setNewCatColor] = useState('#3b82f6');

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

  const addCategory = () => {
    if (!newCatName) return;
    const newCat: Category = {
      id: Math.random().toString(36).substr(2, 9),
      name: newCatName,
      iconName: newCatIcon,
      color: newCatColor,
    };
    setCategories(prev => [...prev, newCat]);
    setNewCatName('');
    toast({ title: "Categoria aggiunta", description: `${newCatName} è ora disponibile.` });
  };

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

  const sharedCategoryData = useMemo(() => {
    const data: Record<string, number> = {};
    expenses.filter(e => e.splitType !== 'personal').forEach(exp => {
      const cat = categories.find(c => c.id === exp.categoryId);
      const name = cat?.name || 'Senza Categoria';
      data[name] = (data[name] || 0) + exp.amount;
    });
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [expenses, categories]);

  const personalBreakdownData = useMemo(() => {
    let u1RealTotal = 0;
    let u2RealTotal = 0;

    expenses.forEach(exp => {
      if (exp.splitType === 'personal') {
        if (exp.paidBy === 'u1') u1RealTotal += exp.amount;
        else u2RealTotal += exp.amount;
      } else if (exp.splitType === 'split') {
        u1RealTotal += exp.amount / 2;
        u2RealTotal += exp.amount / 2;
      } else if (exp.splitType === 'for_other') {
        if (exp.paidBy === 'u1') u2RealTotal += exp.amount;
        else u1RealTotal += exp.amount;
      }
    });

    return [
      { name: user1Name, value: u1RealTotal },
      { name: user2Name, value: u2RealTotal }
    ];
  }, [expenses, user1Name, user2Name]);

  const totalSharedSpent = useMemo(() => 
    expenses
      .filter(e => e.splitType !== 'personal')
      .reduce((acc, curr) => acc + curr.amount, 0), 
    [expenses]
  );

  const sortedExpenses = useMemo(() => {
    return [...expenses].sort((a, b) => compareDesc(parseISO(a.date), parseISO(b.date)));
  }, [expenses]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 max-w-2xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary rounded text-white shadow-sm">
              <Users className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-primary">{groupName}</h1>
          </div>
          
          <Dialog open={isFormOpen} onOpenChange={(open) => {
            setIsFormOpen(open);
            if (!open) setEditingExpense(null);
          }}>
            <DialogTrigger asChild>
              <Button size="icon" className="rounded-full w-12 h-12 shadow-xl hover:scale-105 transition-transform">
                <Plus className="w-7 h-7" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden">
              <DialogHeader className="p-6 pb-2">
                <DialogTitle>{editingExpense ? 'Modifica Spesa' : 'Nuova Spesa'}</DialogTitle>
              </DialogHeader>
              <div className="p-6 pt-0">
                <ExpenseForm 
                  onAdd={addExpense} 
                  initialData={editingExpense}
                  categories={categories}
                  user1Name={user1Name}
                  user2Name={user2Name}
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="container max-w-2xl mx-auto p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          
          <TabsContent value="dashboard" className="space-y-6 m-0">
            <Card className={`border-none shadow-xl transition-all duration-500 overflow-hidden ${
              balances.diff === 0 ? 'bg-primary' : 
              balances.u2OwesU1 > 0 ? 'bg-emerald-500' : 'bg-rose-500'
            }`}>
              <CardContent className="p-6 text-white">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <p className="text-xs font-bold uppercase tracking-wider opacity-80">Bilancio Attuale</p>
                    <h2 className="text-2xl font-black">
                      {balances.diff === 0 ? "Siete in pari!" : 
                       balances.u2OwesU1 > 0 ? `${user2Name} deve a ${user1Name} €${balances.u2OwesU1.toFixed(2)}` : 
                       `${user1Name} deve a ${user2Name} €${balances.u1OwesU2.toFixed(2)}`}
                    </h2>
                  </div>
                  <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                    <ArrowRightLeft className="w-8 h-8" />
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-white/20 flex justify-between items-center">
                  <span className="text-sm font-medium opacity-90">Totale spese comuni:</span>
                  <span className="text-xl font-black">€{totalSharedSpent.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

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
                    
                    const cat = categories.find(c => c.id === exp.categoryId);
                    const CategoryIcon = cat ? AVAILABLE_ICONS[cat.iconName as IconName] : AVAILABLE_ICONS['Layers'];

                    return (
                      <div key={exp.id} className="space-y-3">
                        {showMonthHeader && (
                          <div className="sticky top-20 z-10 py-1.5 px-4 bg-muted/95 backdrop-blur-sm rounded-full inline-block text-xs font-black uppercase tracking-widest text-muted-foreground shadow-sm">
                            {format(currentDate, 'MMMM yyyy', { locale: it })}
                          </div>
                        )}
                        
                        <Card className="group border-none shadow-md hover:shadow-lg transition-all active:scale-[0.98]">
                          <CardContent className="p-4 flex justify-between items-center gap-3">
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                              <div 
                                className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-sm"
                                style={{ backgroundColor: cat?.color || '#6b7280' }}
                              >
                                <CategoryIcon className="w-6 h-6" />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="font-bold text-foreground truncate">{exp.description}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-muted-foreground font-bold">
                                    {format(parseISO(exp.date), 'dd MMM', { locale: it })}
                                  </span>
                                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-muted-foreground/20 text-muted-foreground font-bold">
                                    {exp.splitType === 'split' ? '50/50' : exp.splitType === 'personal' ? 'PERS.' : 'PER ALTRO'}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <p className="font-black text-lg">€{exp.amount.toFixed(2)}</p>
                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">
                                  Pagato da {exp.paidBy === 'u1' ? user1Name : user2Name}
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
                  <div className="text-center py-20 text-muted-foreground bg-muted/20 rounded-3xl">
                    <Receipt className="w-12 h-12 opacity-20 mx-auto mb-4" />
                    <p className="font-medium">Nessuna spesa registrata.</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="condivise" className="space-y-6 m-0">
            <h2 className="text-2xl font-black px-1">Analisi Condivise</h2>
            <SpendingChart data={sharedCategoryData} />
          </TabsContent>

          <TabsContent value="personali" className="space-y-6 m-0">
            <h2 className="text-2xl font-black px-1">Spese Reali</h2>
            <SpendingChart data={personalBreakdownData} />
            <div className="grid grid-cols-2 gap-4">
               {personalBreakdownData.map((item) => (
                 <Card key={item.name} className="border-none shadow-md bg-muted/30">
                   <CardContent className="p-4 text-center">
                     <p className="text-xs font-bold text-muted-foreground uppercase">{item.name}</p>
                     <p className="text-xl font-black text-foreground">€{item.value.toFixed(2)}</p>
                   </CardContent>
                 </Card>
               ))}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6 m-0">
            <h2 className="text-2xl font-black px-1">Impostazioni</h2>
            
            <Card className="border-none shadow-md overflow-hidden">
              <CardHeader className="bg-primary/5 p-4">
                <CardTitle className="text-sm font-black uppercase text-primary">Gestione Gruppo</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label className="font-bold">Nome Gruppo</Label>
                  <Input value={groupName} onChange={(e) => setGroupName(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-bold">Persona 1</Label>
                    <Input value={user1Name} onChange={(e) => setUser1Name(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">Persona 2</Label>
                    <Input value={user2Name} onChange={(e) => setUser2Name(e.target.value)} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md overflow-hidden">
              <CardHeader className="bg-primary/5 p-4 flex flex-row justify-between items-center">
                <CardTitle className="text-sm font-black uppercase text-primary">Le Tue Categorie</CardTitle>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 gap-1 font-bold">
                      <PlusCircle className="w-4 h-4" /> Aggiungi
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Nuova Categoria</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label>Nome</Label>
                        <Input value={newCatName} onChange={(e) => setNewCatName(e.target.value)} placeholder="es. Animali" />
                      </div>
                      <div className="space-y-2">
                        <Label>Icona</Label>
                        <div className="grid grid-cols-5 gap-2 max-h-40 overflow-y-auto p-2 border rounded-md">
                          {Object.keys(AVAILABLE_ICONS).map((iconKey) => {
                            const IconComp = AVAILABLE_ICONS[iconKey as IconName];
                            return (
                              <Button
                                key={iconKey}
                                variant={newCatIcon === iconKey ? 'default' : 'outline'}
                                size="icon"
                                onClick={() => setNewCatIcon(iconKey as IconName)}
                                className="h-10 w-10"
                              >
                                <IconComp className="w-5 h-5" />
                              </Button>
                            );
                          })}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Colore</Label>
                        <div className="flex gap-2 flex-wrap">
                          {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#06b6d4', '#6b7280'].map(color => (
                            <button
                              key={color}
                              className={`w-8 h-8 rounded-full border-2 transition-transform ${newCatColor === color ? 'scale-110 border-black' : 'border-transparent'}`}
                              style={{ backgroundColor: color }}
                              onClick={() => setNewCatColor(color)}
                            >
                              {newCatColor === color && <Check className="w-4 h-4 text-white mx-auto" />}
                            </button>
                          ))}
                        </div>
                      </div>
                      <Button className="w-full font-bold" onClick={addCategory}>Salva Categoria</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-2">
                  {categories.map(cat => {
                    const IconComp = AVAILABLE_ICONS[cat.iconName as IconName] || AVAILABLE_ICONS['Layers'];
                    return (
                      <div key={cat.id} className="flex items-center gap-2 p-2 bg-muted/40 rounded-xl border border-transparent hover:border-primary/20 transition-colors">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: cat.color }}>
                          <IconComp className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold truncate">{cat.name}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 gap-3">
              <Button variant="outline" className="justify-start gap-3 h-14 rounded-2xl border-none shadow-sm font-bold" onClick={() => toast({ title: "Link Copiato!", description: "Invia questo link per invitare qualcuno." })}>
                <Share2 className="w-5 h-5 text-primary" /> Condividi Accesso
              </Button>
              <Button variant="outline" className="justify-start gap-3 h-14 rounded-2xl border-none shadow-sm font-bold">
                <Download className="w-5 h-5 text-primary" /> Esporta tutto (CSV)
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t px-2 h-20 flex items-center justify-around max-w-2xl mx-auto shadow-[0_-5px_20px_-15px_rgba(0,0,0,0.3)]">
        {[
          { id: 'dashboard', icon: LayoutDashboard, label: 'Registro' },
          { id: 'condivise', icon: PieIcon, label: 'Condivise' },
          { id: 'personali', icon: User, label: 'Personali' },
          { id: 'settings', icon: Settings, label: 'Opzioni' }
        ].map((item) => (
          <Button 
            key={item.id}
            variant="ghost" 
            className={`flex flex-col items-center gap-1.5 h-auto py-2 px-1 min-w-[70px] transition-all ${activeTab === item.id ? 'text-primary' : 'text-muted-foreground'}`}
            onClick={() => setActiveTab(item.id)}
          >
            <item.icon className={`w-6 h-6 transition-transform ${activeTab === item.id ? 'scale-110' : ''}`} />
            <span className="text-[10px] font-black uppercase tracking-wider">{item.label}</span>
            {activeTab === item.id && <div className="absolute bottom-1 w-1 h-1 bg-primary rounded-full" />}
          </Button>
        ))}
      </nav>

      <Toaster />
    </div>
  );
}
