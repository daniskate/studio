"use client";

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Sparkles, Loader2, User, Users, UserCheck, Calendar as CalendarIcon, Save } from 'lucide-react';
import { EXPENSE_CATEGORIES } from '@/app/lib/categories';
import { automaticExpenseCategorization } from '@/ai/flows/automatic-expense-categorization';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Expense } from '@/app/page';

interface ExpenseFormProps {
  onAdd: (expense: Omit<Expense, 'id'>) => void;
  initialData?: Expense | null;
}

export function ExpenseForm({ onAdd, initialData }: ExpenseFormProps) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [paidBy, setPaidBy] = useState('u1');
  const [splitType, setSplitType] = useState<'split' | 'personal' | 'for_other'>('split');
  const [date, setDate] = useState<Date>(new Date());
  const [isCategorizing, setIsCategorizing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (initialData) {
      setDescription(initialData.description);
      setAmount(initialData.amount.toString());
      setCategory(initialData.category);
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
        categories: EXPENSE_CATEGORIES,
      });
      if (result.category) {
        setCategory(result.category);
      }
    } catch (error) {
      console.error("AI categorization failed", error);
    } finally {
      setIsCategorizing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !category) {
      toast({
        variant: "destructive",
        title: "Campi mancanti",
        description: "Inserisci descrizione, importo e categoria.",
      });
      return;
    }
    onAdd({
      description,
      amount: parseFloat(amount),
      category,
      paidBy,
      splitType,
      date: date.toISOString(),
    });
    
    // Reset solo se non siamo in editing
    if (!initialData) {
      setDescription('');
      setAmount('');
      setCategory('');
      setDate(new Date());
    }
    
    toast({
      title: initialData ? "Spesa aggiornata" : "Spesa aggiunta",
      description: `Operazione completata con successo.`,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 py-4">
      <div className="space-y-2">
        <Label htmlFor="description">Cosa avete comprato?</Label>
        <div className="relative">
          <Input
            id="description"
            placeholder="es. Spesa settimanale"
            value={description}
            className="pr-10 h-12 text-lg"
            onChange={(e) => setDescription(e.target.value)}
            onBlur={() => {
               if (description.length > 3 && !category) handleAutoCategorize();
            }}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 text-primary hover:text-primary/80"
            onClick={handleAutoCategorize}
            disabled={isCategorizing || !description}
          >
            {isCategorizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Importo (€)</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            placeholder="0.00"
            className="h-12 text-lg"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="date">Data</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full h-12 justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "dd/MM/yyyy", { locale: it }) : <span>Scegli data</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => d && setDate(d)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Categoria</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger id="category" className="h-12">
            <SelectValue placeholder="Seleziona categoria" />
          </SelectTrigger>
          <SelectContent>
            {EXPENSE_CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4 pt-2">
        <div className="space-y-3">
          <Label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Chi ha pagato?</Label>
          <RadioGroup value={paidBy} onValueChange={setPaidBy} className="flex gap-4">
            <div className="flex items-center space-x-2 bg-muted p-3 rounded-lg flex-1 justify-center cursor-pointer hover:bg-primary/10 transition-colors">
              <RadioGroupItem value="u1" id="u1" />
              <Label htmlFor="u1" className="cursor-pointer font-bold">Marco</Label>
            </div>
            <div className="flex items-center space-x-2 bg-muted p-3 rounded-lg flex-1 justify-center cursor-pointer hover:bg-primary/10 transition-colors">
              <RadioGroupItem value="u2" id="u2" />
              <Label htmlFor="u2" className="cursor-pointer font-bold">Sara</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Come dividere?</Label>
          <RadioGroup value={splitType} onValueChange={(val: any) => setSplitType(val)} className="grid grid-cols-1 gap-2">
            <div className="flex items-center space-x-3 bg-muted p-3 rounded-lg cursor-pointer hover:bg-primary/10 transition-colors">
              <RadioGroupItem value="split" id="split" />
              <Users className="w-4 h-4 text-primary" />
              <Label htmlFor="split" className="cursor-pointer font-medium flex-1">Dividi a metà (50/50)</Label>
            </div>
            <div className="flex items-center space-x-3 bg-muted p-3 rounded-lg cursor-pointer hover:bg-primary/10 transition-colors">
              <RadioGroupItem value="personal" id="personal" />
              <UserCheck className="w-4 h-4 text-primary" />
              <Label htmlFor="personal" className="cursor-pointer font-medium flex-1">Spesa Personale</Label>
            </div>
            <div className="flex items-center space-x-3 bg-muted p-3 rounded-lg cursor-pointer hover:bg-primary/10 transition-colors">
              <RadioGroupItem value="for_other" id="for_other" />
              <User className="w-4 h-4 text-primary" />
              <Label htmlFor="for_other" className="cursor-pointer font-medium flex-1">Tutto per l'altro</Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-14 text-lg rounded-xl shadow-lg">
        {initialData ? <Save className="mr-2" /> : <Plus className="mr-2" />}
        {initialData ? 'Aggiorna Spesa' : 'Salva Transazione'}
      </Button>
    </form>
  );
}
