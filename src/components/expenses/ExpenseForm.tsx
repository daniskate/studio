"use client";

import React, { useState, useEffect } from 'react';
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
    if (!description) return;
    setIsCategorizing(true);
    try {
      const result = await automaticExpenseCategorization({
        transactionDetails: description,
        categories: EXPENSE_CATEGORIES,
      });
      if (result.category) {
        setCategory(result.category);
        toast({
          title: "Category Suggested",
          description: `AI suggested "${result.category}" because: ${result.reason || "it fits best."}`,
        });
      }
    } catch (error) {
      console.error("AI categorization failed", error);
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
  };

  return (
    <Card className="shadow-lg border-primary/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Plus className="w-5 h-5" /> Record Expense
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <div className="relative">
              <Input
                id="description"
                placeholder="e.g., Starbucks Coffee"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={() => {
                   if (description.length > 3 && !category) handleAutoCategorize();
                }}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-secondary hover:text-secondary/80"
                onClick={handleAutoCategorize}
                disabled={isCategorizing || !description}
              >
                {isCategorizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount ($)</Label>
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
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select" />
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
          <Button type="submit" className="w-full bg-secondary hover:bg-secondary/90 text-white">
            Add Transaction
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
