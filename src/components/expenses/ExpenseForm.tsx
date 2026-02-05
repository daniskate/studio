
"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Plus, Loader2 } from 'lucide-react';
import { EXPENSE_CATEGORIES } from '@/app/lib/categories';
import { automaticExpenseCategorization } from '@/ai/flows/automatic-expense-categorization';
import { useToast } from '@/hooks/use-toast';

interface ExpenseFormProps {
  onAdd: (expense: { description: string; amount: number; category: string; date: string }) => void;
}

export function ExpenseForm({ onAdd }: ExpenseFormProps) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [isCategorizing, setIsCategorizing] = useState(false);
  const { toast } = useToast();

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
        toast({
          title: "Categoria Suggerita",
          description: `L'IA ha scelto "${result.category}": ${result.reason || "sembra la più adatta."}`,
        });
      }
    } catch (error) {
      console.error("AI categorization failed", error);
      toast({
        variant: "destructive",
        title: "Errore IA",
        description: "Non è stato possibile categorizzare automaticamente.",
      });
    } finally {
      setIsCategorizing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !category) return;
    onAdd({
      description,
      amount: parseFloat(amount),
      category,
      date: new Date().toISOString(),
    });
    setDescription('');
    setAmount('');
    setCategory('');
    toast({
      title: "Spesa Aggiunta",
      description: `Hai aggiunto €${amount} per ${description}.`,
    });
  };

  return (
    <Card className="shadow-lg border-none">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-primary">
          <Plus className="w-5 h-5" /> Registra Spesa
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Descrizione</Label>
            <div className="relative">
              <Input
                id="description"
                placeholder="es. Caffè al bar"
                value={description}
                className="pr-10"
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
            <p className="text-[10px] text-muted-foreground px-1 italic">Suggerimento: L'IA categorizza per te mentre scrivi.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Importo (€)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Seleziona" />
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
          </div>
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-11">
            Aggiungi Transazione
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
