import type { ContributionDay, GitHubData } from '@/types/statistics';
import { GH_STATISTICS_API_ENDPOINT } from '@/data/properties.json';

export async function getContributions(
  year: string,
): Promise<{ days: ContributionDay[]; total: number } | null> {
  try {
    const response = await fetch(`${GH_STATISTICS_API_ENDPOINT}${!year ? 'last' : year}`);
    if (!response.ok) {
      return null;
    }
    const data: GitHubData = await response.json();

    return {
      days: data.contributions,
      total: Object.values(data.total)[0] || 0,
    };
  } catch (e) {
    return null;
  }
}
