import type { ContributionDay, GitHubData } from '@/types/statistics';
import { GH_STATISTICS_API_ENDPOINT, GH_USERNAME } from '@/data/properties.json';

export async function getContributions(
  year: string,
): Promise<{ days: ContributionDay[]; total: number } | null> {
  if (!year) {
    year = 'last';
  }

  const response = await fetch(`${GH_STATISTICS_API_ENDPOINT}${GH_USERNAME}?y=${year}`);
  if (!response.ok) {
    return null;
  }
  const data: GitHubData = await response.json();

  return {
    days: data.contributions,
    total: Object.values(data.total)[0] || 0,
  };
}
