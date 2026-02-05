
"use client";

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Sparkles, Loader2, User, Users, UserCheck, Calendar as CalendarIcon, Save, Plus } from 'lucide-react';
import { Category, AVAILABLE_ICONS, IconName } from '@/app/lib/categories';
import { automaticExpenseCategorization } from '@/ai/flows/automatic-expense-categorization';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Expense } from '@/app/page';

interface ExpenseFormProps {
  onAdd: (expense: Omit<Expense, 'id'>) => void;
  initialData?: Expense | null;
  categories: Category[];
  user1Name?: string;
  user2Name?: string;
}

export function ExpenseForm({ onAdd, initialData, categories, user1Name = 'Marco', user2Name = 'Sara' }: ExpenseFormProps) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [paidBy, setPaidBy] = useState('u1');
  const [splitType, setSplitType] = useState<'split' | 'personal' | 'for_other'>('split');
  const [date, setDate] = useState<Date>(new Date());
  const [isCategorizing, setIsCategorizing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (initialData) {
      setDescription(initialData.description);
      setAmount(initialData.amount.toString());
      setCategoryId(initialData.categoryId);
      setPaidBy(initialData.paidBy);
      setSplitType(initialData.splitType);
      setDate(new Date(initialData.date));
    }
  }, [initialData]);

  const handleAutoCategorize = async () => {
    if (!description || description.length < 3) return;
    setIsCategorizing(true);
    try {
      const result = await automaticExpenseCategorization({
        transactionDetails: description,
        categories: categories.map(c => c.name),
      });
      if (result.category) {
        const matched = categories.find(c => c.name.toLowerCase() === result.category.toLowerCase());
        if (matched) setCategoryId(matched.id);
      }
    } catch (error) {
      // Ignored
    } finally {
      setIsCategorizing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !categoryId) {
      toast({
        variant: "destructive",
        title: "Dati mancanti",
        description: "Inserisci descrizione, importo e categoria.",
      });
      return;
    }
    onAdd({
      description,
      amount: parseFloat(amount),
      categoryId,
      paidBy,
      splitType,
      date: date.toISOString(),
    });
    
    if (!initialData) {
      setDescription('');
      setAmount('');
      setCategoryId('');
      setDate(new Date());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <Label className="text-xs font-black uppercase text-muted-foreground ml-1">Descrizione</Label>
        <div className="relative">
          <Input
            placeholder="es. Cena fuori"
            value={description}
            className="h-12 rounded-xl text-base border-muted"
            onChange={(e) => setDescription(e.target.value)}
            onBlur={() => { if (description.length > 3 && !categoryId) handleAutoCategorize(); }}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 text-primary"
            onClick={handleAutoCategorize}
            disabled={isCategorizing || !description}
          >
            {isCategorizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-black uppercase text-muted-foreground ml-1">Quanto? (€)</Label>
          <Input
            type="number"
            step="0.01"
            placeholder="0.00"
            className="h-12 rounded-xl text-lg font-black border-muted"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-black uppercase text-muted-foreground ml-1">Quando?</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full h-12 rounded-xl justify-start font-bold border-muted">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(date, "dd/MM/yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-black uppercase text-muted-foreground ml-1">Categoria</Label>
        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger className="h-12 rounded-xl border-muted font-bold">
            <SelectValue placeholder="Scegli categoria" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            {categories.map((cat) => {
              const IconComp = AVAILABLE_ICONS[cat.iconName as IconName] || AVAILABLE_ICONS['Layers'];
              return (
                <SelectItem key={cat.id} value={cat.id}>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-md flex items-center justify-center text-white" style={{ backgroundColor: cat.color }}>
                      <IconComp className="w-3.5 h-3.5" />
                    </div>
                    {cat.name}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4 pt-2">
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1 tracking-widest">Chi ha pagato?</Label>
          <RadioGroup value={paidBy} onValueChange={setPaidBy} className="flex gap-2">
            {[
              { id: 'u1', name: user1Name },
              { id: 'u2', name: user2Name }
            ].map(u => (
              <div key={u.id} className={`flex items-center space-x-2 bg-muted/40 p-3 rounded-xl flex-1 justify-center cursor-pointer border-2 transition-all ${paidBy === u.id ? 'border-primary bg-primary/5' : 'border-transparent'}`} onClick={() => setPaidBy(u.id)}>
                <RadioGroupItem value={u.id} id={u.id} className="hidden" />
                <Label htmlFor={u.id} className="cursor-pointer font-black text-xs uppercase">{u.name}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1 tracking-widest">Come dividiamo?</Label>
          <RadioGroup value={splitType} onValueChange={(val: any) => setSplitType(val)} className="grid grid-cols-1 gap-1.5">
            {[
              { id: 'split', icon: Users, label: 'Divisa (50/50)' },
              { id: 'personal', icon: UserCheck, label: 'Solo per me' },
              { id: 'for_other', icon: User, label: 'Tutto per l\'altro' }
            ].map(type => (
              <div key={type.id} className={`flex items-center space-x-3 bg-muted/40 p-3 rounded-xl cursor-pointer border-2 transition-all ${splitType === type.id ? 'border-primary bg-primary/5' : 'border-transparent'}`} onClick={() => setSplitType(type.id as any)}>
                <RadioGroupItem value={type.id} id={type.id} className="hidden" />
                <type.icon className={`w-5 h-5 ${splitType === type.id ? 'text-primary' : 'text-muted-foreground'}`} />
                <Label htmlFor={type.id} className="cursor-pointer font-bold text-sm flex-1">{type.label}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </div>

      <Button type="submit" className="w-full h-14 rounded-2xl font-black text-lg shadow-lg hover:shadow-xl transition-all">
        {initialData ? <Save className="mr-2" /> : <Plus className="mr-2 h-6 w-6" />}
        {initialData ? 'AGGIORNA SPESA' : 'SALVA SPESA'}
      </Button>
    </form>
  );
}
