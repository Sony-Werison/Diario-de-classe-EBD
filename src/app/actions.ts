'use server';

import { suggestBehavioralInterventions } from '@/ai/flows/suggest-behavioral-interventions';

export async function getAiSuggestions(
  studentName: string,
  attendanceRate: number,
  homeworkCompletionRate: number
) {
  try {
    const result = await suggestBehavioralInterventions({
      studentName,
      attendanceRate,
      homeworkCompletionRate,
    });
    return { success: true, suggestions: result.interventionSuggestions };
  } catch (error) {
    console.error('Error getting AI suggestions:', error);
    return { success: false, error: 'Failed to get suggestions from AI.' };
  }
}
