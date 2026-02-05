"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, RefreshCw } from 'lucide-react';

interface Subscription {
  id: string;
  name: string;
  amount: number;
  renewalDate: string;
}

interface SubscriptionListProps {
  subscriptions: Subscription[];
}

export function SubscriptionList({ subscriptions }: SubscriptionListProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <RefreshCw className="w-5 h-5" /> Ongoing Subscriptions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {subscriptions.map((sub) => (
            <div key={sub.id} className="flex items-center justify-between p-3 rounded-lg border border-primary/5 hover:bg-accent transition-colors">
              <div className="flex flex-col">
                <span className="font-semibold text-foreground">{sub.name}</span>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <Calendar className="w-3 h-3" />
                  Renews: {new Date(sub.renewalDate).toLocaleDateString()}
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-secondary">${sub.amount.toFixed(2)}</p>
                <Badge variant="outline" className="text-[10px] uppercase">Monthly</Badge>
              </div>
            </div>
          ))}
          {subscriptions.length === 0 && (
            <p className="text-center text-muted-foreground py-10">No active subscriptions tracked.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
