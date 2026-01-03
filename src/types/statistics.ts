export interface ContributionDay {
  date: string;
  count: number;
  level: number;
}

export interface GitHubData {
  total: {
    [year: string]: number;
  };
  contributions: Array<ContributionDay>;
}
