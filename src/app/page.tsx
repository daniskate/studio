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
  Check,
  User,
  PlusCircle,
  TrendingUp
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
  const [newCatColor, setNewCatColor] = useState('#2D6A4F');

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
      const name = cat?.name || 'Altro';
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
    <div className="min-h-screen bg-background pb-24 font-body">
      <header className="sticky top-0 z-50 w-full border-b bg-primary text-white shadow-md">
        <div className="container flex h-16 items-center justify-between px-6 max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-full">
              <Users className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-black tracking-tight">{groupName}</h1>
          </div>
          
          <Dialog open={isFormOpen} onOpenChange={(open) => {
            setIsFormOpen(open);
            if (!open) setEditingExpense(null);
          }}>
            <DialogTrigger asChild>
              <Button size="icon" className="rounded-full w-12 h-12 bg-white text-primary shadow-xl hover:scale-105 transition-transform">
                <Plus className="w-7 h-7" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden rounded-[2.5rem] border-none">
              <DialogHeader className="p-8 pb-2">
                <DialogTitle className="text-2xl font-black text-primary">
                  {editingExpense ? 'Modifica Spesa' : 'Nuova Spesa'}
                </DialogTitle>
              </DialogHeader>
              <div className="p-8 pt-0">
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

      <main className="container max-w-2xl mx-auto p-4 md:p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          
          <TabsContent value="dashboard" className="space-y-6 m-0">
            {/* Balance Card - Styled like "Saldo" in Monefy */}
            <Card className={`border-none shadow-2xl rounded-[2.5rem] overflow-hidden transition-colors duration-500 ${
              balances.diff === 0 ? 'bg-primary' : 
              balances.u2OwesU1 > 0 ? 'bg-[#386641]' : 'bg-[#bc4749]'
            }`}>
              <CardContent className="p-8 text-white">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">Stato Bilancio</p>
                    <h2 className="text-3xl font-black leading-tight">
                      {balances.diff === 0 ? "Siete in pari!" : 
                       balances.u2OwesU1 > 0 ? `${user2Name} deve dare €${balances.u2OwesU1.toFixed(2)} a ${user1Name}` : 
                       `${user1Name} deve dare €${balances.u1OwesU2.toFixed(2)} a ${user2Name}`}
                    </h2>
                  </div>
                  <div className="p-4 bg-white/10 rounded-3xl backdrop-blur-xl border border-white/20">
                    <ArrowRightLeft className="w-8 h-8" />
                  </div>
                </div>
                <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 opacity-70" />
                    <span className="text-xs font-bold uppercase tracking-wider opacity-70">Totale spese comuni</span>
                  </div>
                  <span className="text-2xl font-black">€{totalSharedSpent.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 px-2">
                <Receipt className="w-4 h-4" /> Registro Transazioni
              </h3>
              
              <div className="space-y-8">
                {sortedExpenses.length > 0 ? (
                  sortedExpenses.map((exp, index) => {
                    const currentDate = parseISO(exp.date);
                    const showMonthHeader = index === 0 || 
                      format(parseISO(sortedExpenses[index-1].date), 'MMMM', { locale: it }) !== format(currentDate, 'MMMM', { locale: it });
                    
                    const cat = categories.find(c => c.id === exp.categoryId);
                    const CategoryIcon = cat ? AVAILABLE_ICONS[cat.iconName as IconName] : AVAILABLE_ICONS['Layers'];

                    return (
                      <div key={exp.id} className="space-y-4">
                        {showMonthHeader && (
                          <div className="sticky top-20 z-10 py-2 px-6 bg-secondary/80 backdrop-blur-md rounded-full inline-block text-[10px] font-black uppercase tracking-[0.2em] text-primary shadow-sm mx-2">
                            {format(currentDate, 'MMMM yyyy', { locale: it })}
                          </div>
                        )}
                        
                        <Card className="group border-none shadow-sm hover:shadow-md transition-all active:scale-[0.98] rounded-[2rem] overflow-hidden">
                          <CardContent className="p-5 flex justify-between items-center gap-4">
                            <div className="flex items-center gap-5 flex-1 min-w-0">
                              <div 
                                className="w-14 h-14 rounded-full flex items-center justify-center text-white shrink-0 shadow-lg"
                                style={{ backgroundColor: cat?.color || '#6b7280' }}
                              >
                                <CategoryIcon className="w-7 h-7" />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="font-black text-foreground text-lg truncate leading-none mb-1">{exp.description}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                                    {format(parseISO(exp.date), 'dd MMM', { locale: it })}
                                  </span>
                                  <Badge variant="secondary" className="text-[9px] px-2 py-0.5 rounded-full border-none font-black tracking-widest bg-primary/5 text-primary">
                                    {exp.splitType === 'split' ? 'DIVISA' : exp.splitType === 'personal' ? 'PERS.' : 'PER ALTRO'}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="font-black text-xl tracking-tighter">€{exp.amount.toFixed(2)}</p>
                                <p className="text-[9px] text-muted-foreground font-black uppercase tracking-wider">
                                  Da {exp.paidBy === 'u1' ? user1Name : user2Name}
                                </p>
                              </div>
                              
                              <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary" onClick={() => startEdit(exp)}>
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive" onClick={() => deleteExpense(exp.id)}>
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
                  <div className="text-center py-24 text-muted-foreground bg-secondary/30 rounded-[3rem] border-2 border-dashed border-primary/10">
                    <Receipt className="w-16 h-16 opacity-10 mx-auto mb-6" />
                    <p className="font-black uppercase tracking-widest text-xs opacity-50">Nessuna spesa nel registro</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="condivise" className="space-y-8 m-0">
            <h2 className="text-3xl font-black text-primary px-2 tracking-tight">Analisi Condivise</h2>
            <SpendingChart data={sharedCategoryData} />
          </TabsContent>

          <TabsContent value="personali" className="space-y-8 m-0">
            <h2 className="text-3xl font-black text-primary px-2 tracking-tight">Spese Reali</h2>
            <SpendingChart data={personalBreakdownData} />
            <div className="grid grid-cols-2 gap-5">
               {personalBreakdownData.map((item) => (
                 <Card key={item.name} className="border-none shadow-xl rounded-[2.5rem] bg-white">
                   <CardContent className="p-6 text-center">
                     <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">{item.name}</p>
                     <p className="text-2xl font-black text-primary">€{item.value.toFixed(2)}</p>
                   </CardContent>
                 </Card>
               ))}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-8 m-0">
            <h2 className="text-3xl font-black text-primary px-2 tracking-tight">Impostazioni</h2>
            
            <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden">
              <CardHeader className="bg-primary/5 p-6">
                <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-primary">Dati del Gruppo</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Nome del Gruppo</Label>
                  <Input value={groupName} className="rounded-2xl h-12 border-muted" onChange={(e) => setGroupName(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Partecipante 1</Label>
                    <Input value={user1Name} className="rounded-2xl h-12 border-muted" onChange={(e) => setUser1Name(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Partecipante 2</Label>
                    <Input value={user2Name} className="rounded-2xl h-12 border-muted" onChange={(e) => setUser2Name(e.target.value)} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden">
              <CardHeader className="bg-primary/5 p-6 flex flex-row justify-between items-center">
                <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-primary">Categorie</CardTitle>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="rounded-full h-8 gap-1 font-black uppercase text-[10px] tracking-widest hover:bg-primary/10 hover:text-primary">
                      <PlusCircle className="w-4 h-4" /> Aggiungi
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="rounded-[2.5rem] p-8">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-black text-primary">Nuova Categoria</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 pt-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest">Nome Categoria</Label>
                        <Input value={newCatName} className="rounded-2xl h-12" onChange={(e) => setNewCatName(e.target.value)} placeholder="es. Animali" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest">Scegli Icona</Label>
                        <div className="grid grid-cols-5 gap-3 max-h-48 overflow-y-auto p-4 bg-secondary/30 rounded-3xl border-2 border-muted">
                          {Object.keys(AVAILABLE_ICONS).map((iconKey) => {
                            const IconComp = AVAILABLE_ICONS[iconKey as IconName];
                            return (
                              <Button
                                key={iconKey}
                                variant={newCatIcon === iconKey ? 'default' : 'outline'}
                                size="icon"
                                onClick={() => setNewCatIcon(iconKey as IconName)}
                                className={`h-12 w-12 rounded-2xl transition-all ${newCatIcon === iconKey ? 'bg-primary shadow-lg scale-110' : 'bg-white'}`}
                              >
                                <IconComp className="w-6 h-6" />
                              </Button>
                            );
                          })}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest">Scegli Colore</Label>
                        <div className="flex gap-3 flex-wrap p-4 bg-secondary/30 rounded-3xl">
                          {['#2D6A4F', '#1B4332', '#F59E0B', '#EF4444', '#EC4899', '#8B5CF6', '#06B6D4', '#6B7280', '#000000', '#FF5733'].map(color => (
                            <button
                              key={color}
                              className={`w-10 h-10 rounded-full border-4 transition-transform ${newCatColor === color ? 'scale-110 border-white shadow-lg' : 'border-transparent'}`}
                              style={{ backgroundColor: color }}
                              onClick={() => setNewCatColor(color)}
                            >
                              {newCatColor === color && <Check className="w-5 h-5 text-white mx-auto" />}
                            </button>
                          ))}
                        </div>
                      </div>
                      <Button className="w-full h-14 rounded-3xl font-black text-lg shadow-xl" onClick={addCategory}>SALVA CATEGORIA</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-3">
                  {categories.map(cat => {
                    const IconComp = AVAILABLE_ICONS[cat.iconName as IconName] || AVAILABLE_ICONS['Layers'];
                    return (
                      <div key={cat.id} className="flex items-center gap-3 p-3 bg-secondary/40 rounded-[1.5rem] border-2 border-transparent hover:border-primary/20 transition-all group">
                        <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform" style={{ backgroundColor: cat.color }}>
                          <IconComp className="w-5 h-5" />
                        </div>
                        <span className="text-[11px] font-black uppercase tracking-wider truncate">{cat.name}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 gap-4">
              <Button variant="outline" className="justify-start gap-4 h-16 rounded-[2rem] border-none shadow-xl font-black uppercase text-[10px] tracking-[0.2em]" onClick={() => toast({ title: "Link Copiato!", description: "Invia questo link per invitare qualcuno." })}>
                <Share2 className="w-6 h-6 text-primary" /> Condividi Accesso
              </Button>
              <Button variant="outline" className="justify-start gap-4 h-16 rounded-[2rem] border-none shadow-xl font-black uppercase text-[10px] tracking-[0.2em]">
                <Download className="w-6 h-6 text-primary" /> Esporta tutto (CSV)
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-2xl border-t px-4 h-22 flex items-center justify-around max-w-2xl mx-auto shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] rounded-t-[2.5rem]">
        {[
          { id: 'dashboard', icon: LayoutDashboard, label: 'Registro' },
          { id: 'condivise', icon: PieIcon, label: 'Condivise' },
          { id: 'personali', icon: User, label: 'Personali' },
          { id: 'settings', icon: Settings, label: 'Opzioni' }
        ].map((item) => (
          <Button 
            key={item.id}
            variant="ghost" 
            className={`flex flex-col items-center gap-2 h-auto py-3 px-2 min-w-[75px] transition-all rounded-3xl ${activeTab === item.id ? 'text-primary bg-primary/5' : 'text-muted-foreground'}`}
            onClick={() => setActiveTab(item.id)}
          >
            <item.icon className={`w-6 h-6 transition-transform ${activeTab === item.id ? 'scale-110 stroke-[2.5px]' : 'stroke-2'}`} />
            <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
            {activeTab === item.id && <div className="mt-1 w-1.5 h-1.5 bg-primary rounded-full shadow-sm" />}
          </Button>
        ))}
      </nav>

      <Toaster />
    </div>
  );
}