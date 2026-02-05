'use server';
/**
 * @fileOverview Implements the automatic expense categorization flow using AI.
 *
 * This file defines the flow for automatically categorizing expenses based on transaction details.
 * It uses a Genkit prompt to interact with an LLM for categorization and includes schemas for input and output.
 *
 * @module automatic-expense-categorization
 *
 * @interface AutomaticExpenseCategorizationInput - The input type for the automaticExpenseCategorization function.
 * @interface AutomaticExpenseCategorizationOutput - The output type for the automaticExpenseCategorization function.
 * @function automaticExpenseCategorization - The main function to categorize expenses automatically.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AutomaticExpenseCategorizationInputSchema = z.object({
  transactionDetails: z
    .string()
    .describe('The details of the transaction, including description and amount.'),
  categories: z
    .array(z.string())
    .describe('A list of available expense categories.'),
});
export type AutomaticExpenseCategorizationInput = z.infer<
  typeof AutomaticExpenseCategorizationInputSchema
>;

const AutomaticExpenseCategorizationOutputSchema = z.object({
  category: z
    .string()
    .describe('The automatically determined category for the expense.'),
  reason: z
    .string()
    .optional()
    .describe('The reason for choosing this category.'),
});
export type AutomaticExpenseCategorizationOutput = z.infer<
  typeof AutomaticExpenseCategorizationOutputSchema
>;

export async function automaticExpenseCategorization(
  input: AutomaticExpenseCategorizationInput
): Promise<AutomaticExpenseCategorizationOutput> {
  return automaticExpenseCategorizationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'automaticExpenseCategorizationPrompt',
  input: {schema: AutomaticExpenseCategorizationInputSchema},
  output: {schema: AutomaticExpenseCategorizationOutputSchema},
  prompt: `Given the following transaction details and a list of possible categories, determine the most appropriate expense category.

Transaction Details: {{{transactionDetails}}}

Available Categories:
{{#each categories}}- {{{this}}}\n{{/each}}

Respond with the determined category and a brief reason for the choice.
`,
});

const automaticExpenseCategorizationFlow = ai.defineFlow(
  {
    name: 'automaticExpenseCategorizationFlow',
    inputSchema: AutomaticExpenseCategorizationInputSchema,
    outputSchema: AutomaticExpenseCategorizationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
