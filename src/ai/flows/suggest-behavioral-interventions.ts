'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting behavioral interventions
 * based on student attendance and homework completion data.
 *
 * - suggestBehavioralInterventions -  A function that takes student data as input and returns suggested interventions.
 * - SuggestBehavioralInterventionsInput - The input type for the suggestBehavioralInterventions function.
 * - SuggestBehavioralInterventionsOutput - The return type for the suggestBehavioralInterventions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestBehavioralInterventionsInputSchema = z.object({
  studentName: z.string().describe('The name of the student.'),
  attendanceRate: z
    .number()
    .min(0)
    .max(1)
    .describe("The student's attendance rate (0 to 1). 0 is never present, 1 is always present."),
  homeworkCompletionRate: z
    .number()
    .min(0)
    .max(1)
    .describe("The student's homework completion rate (0 to 1). 0 is never completes homework, 1 always completes homework."),
});
export type SuggestBehavioralInterventionsInput = z.infer<
  typeof SuggestBehavioralInterventionsInputSchema
>;

const SuggestBehavioralInterventionsOutputSchema = z.object({
  interventionSuggestions: z
    .array(z.string())
    .describe(
      'A list of personalized intervention suggestions to improve student behavior and participation.'
    ),
});
export type SuggestBehavioralInterventionsOutput = z.infer<
  typeof SuggestBehavioralInterventionsOutputSchema
>;

export async function suggestBehavioralInterventions(
  input: SuggestBehavioralInterventionsInput
): Promise<SuggestBehavioralInterventionsOutput> {
  return suggestBehavioralInterventionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestBehavioralInterventionsPrompt',
  input: {schema: SuggestBehavioralInterventionsInputSchema},
  output: {schema: SuggestBehavioralInterventionsOutputSchema},
  prompt: `Based on the student's attendance rate of {{attendanceRate}} and homework completion rate of {{homeworkCompletionRate}}, suggest personalized interventions for {{studentName}} to improve their behavior and participation in class. Return a list of suggestions.`,
});

const suggestBehavioralInterventionsFlow = ai.defineFlow(
  {
    name: 'suggestBehavioralInterventionsFlow',
    inputSchema: SuggestBehavioralInterventionsInputSchema,
    outputSchema: SuggestBehavioralInterventionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
