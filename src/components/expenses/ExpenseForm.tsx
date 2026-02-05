
"use client";

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { User, Users, UserCheck, Calendar as CalendarIcon, Save, Plus } from 'lucide-react';
import { Category, AVAILABLE_ICONS, IconName } from '@/app/lib/categories';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Expense } from '@/app/page';

interface ExpenseFormProps {
  onAdd: (expense: Omit<Expense, 'id' | 'groupId'>) => void;
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Descrizione</Label>
        <Input
          placeholder="es. Pizza e birra"
          value={description}
          className="h-16 rounded-[1.5rem] text-lg border-2 border-muted focus:border-primary px-6 shadow-sm"
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Quanto? (€)</Label>
          <Input
            type="number"
            step="0.01"
            placeholder="0.00"
            className="h-16 rounded-[1.5rem] text-2xl font-black border-2 border-muted focus:border-primary px-6 shadow-sm"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Quando?</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full h-16 rounded-[1.5rem] justify-start font-black text-sm border-2 border-muted px-6 shadow-sm">
                <CalendarIcon className="mr-3 h-5 w-5 text-primary" />
                {format(date, "dd/MM/yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 rounded-[2rem] border-none shadow-2xl" align="start">
              <Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} className="rounded-[2rem]" />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Categoria</Label>
        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger className="h-16 rounded-[1.5rem] border-2 border-muted px-6 font-black uppercase text-[10px] tracking-widest shadow-sm">
            <SelectValue placeholder="Scegli categoria" />
          </SelectTrigger>
          <SelectContent className="rounded-[1.5rem] border-none shadow-2xl">
            {categories.map((cat) => {
              const IconComp = AVAILABLE_ICONS[cat.iconName as IconName] || AVAILABLE_ICONS['Layers'];
              return (
                <SelectItem key={cat.id} value={cat.id} className="rounded-xl my-1">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-md" style={{ backgroundColor: cat.color }}>
                      <IconComp className="w-4 h-4" />
                    </div>
                    <span className="font-black uppercase tracking-widest text-[10px]">{cat.name}</span>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-6 pt-4">
        <div className="space-y-3">
          <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Chi ha pagato?</Label>
          <RadioGroup value={paidBy} onValueChange={setPaidBy} className="flex gap-3">
            {[
              { id: 'u1', name: user1Name },
              { id: 'u2', name: user2Name }
            ].map(u => (
              <div 
                key={u.id} 
                className={`flex items-center space-x-2 p-4 rounded-2xl flex-1 justify-center cursor-pointer border-2 transition-all shadow-sm ${paidBy === u.id ? 'border-primary bg-primary/5 text-primary' : 'border-muted bg-white text-muted-foreground'}`} 
                onClick={() => setPaidBy(u.id)}
              >
                <RadioGroupItem value={u.id} id={u.id} className="hidden" />
                <Label htmlFor={u.id} className="cursor-pointer font-black text-xs uppercase tracking-widest">{u.name}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="space-y-3">
          <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Come dividiamo?</Label>
          <RadioGroup value={splitType} onValueChange={(val: any) => setSplitType(val)} className="grid grid-cols-1 gap-2">
            {[
              { id: 'split', icon: Users, label: 'Divisa (50/50)' },
              { id: 'personal', icon: UserCheck, label: 'Solo per me' },
              { id: 'for_other', icon: User, label: 'Tutto per l\'altro' }
            ].map(type => (
              <div 
                key={type.id} 
                className={`flex items-center space-x-4 p-4 rounded-2xl cursor-pointer border-2 transition-all shadow-sm ${splitType === type.id ? 'border-primary bg-primary/5 text-primary' : 'border-muted bg-white text-muted-foreground'}`} 
                onClick={() => setSplitType(type.id as any)}
              >
                <RadioGroupItem value={type.id} id={type.id} className="hidden" />
                <type.icon className={`w-6 h-6 ${splitType === type.id ? 'text-primary' : 'text-muted-foreground'}`} />
                <Label htmlFor={type.id} className="cursor-pointer font-black text-xs uppercase tracking-widest flex-1">{type.label}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </div>

      <Button type="submit" className="w-full h-18 rounded-[2rem] font-black text-xl shadow-2xl bg-primary hover:bg-primary/90 transition-all active:scale-95">
        {initialData ? <Save className="mr-3 h-6 w-6" /> : <Plus className="mr-3 h-8 w-8" />}
        {initialData ? 'AGGIORNA' : 'AGGIUNGI'}
      </Button>
    </form>
  );
}
