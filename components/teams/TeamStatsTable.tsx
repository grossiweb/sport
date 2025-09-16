"use client";

import { Team, TeamStats, SportType } from "@/types";

interface TeamStatsTableProps {
  teams: Team[];
  teamStats: TeamStats[];
  isLoading: boolean;
  sport: SportType;
  sortOptions: {
    field: string;
    direction: "asc" | "desc";
  };
  onSortChange: (sortOptions: { field: string; direction: "asc" | "desc" }) => void;
}

export function TeamStatsTable({
  teams,
  teamStats,
  isLoading,
  sport,
  sortOptions,
  onSortChange,
}: TeamStatsTableProps) {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/4 mb-4" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-300 dark:bg-gray-600 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Combine teams with their stats (only teams that have stats)
  const teamStatsData = teams
    .map((team) => {
      const stats = teamStats.find((stat) => stat.teamId === team.id);
      return { team, stats };
    })
    .filter((item) => item.stats);

  // Sort the data
  const sortedData = [...teamStatsData].sort((a, b) => {
    const aValue = (a.stats?.[sortOptions.field as keyof TeamStats] as number | undefined) ?? 0;
    const bValue = (b.stats?.[sortOptions.field as keyof TeamStats] as number | undefined) ?? 0;
    return sortOptions.direction === "asc" ? Number(aValue) - Number(bValue) : Number(bValue) - Number(aValue);
  });

  const handleSort = (field: string) => {
    const direction =
      sortOptions.field === field && sortOptions.direction === "desc" ? "asc" : "desc";
    onSortChange({ field, direction });
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortOptions.field !== field) return <span className="text-gray-400">↕</span>;
    return sortOptions.direction === "desc" ? <span>↓</span> : <span>↑</span>;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          {sport} Team Statistics
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">{sortedData.length} teams</p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Team
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {sport === "CFB" ? "Division" : "Division"}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                onClick={() => handleSort("wins")}
              >
                <div className="flex items-center">
                  Wins <SortIcon field="wins" />
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                onClick={() => handleSort("losses")}
              >
                <div className="flex items-center">
                  Losses <SortIcon field="losses" />
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                onClick={() => handleSort("winPercentage")}
              >
                <div className="flex items-center">
                  Win % <SortIcon field="winPercentage" />
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                onClick={() => handleSort("pointsFor")}
              >
                <div className="flex items-center">
                  PF <SortIcon field="pointsFor" />
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                onClick={() => handleSort("pointsAgainst")}
              >
                <div className="flex items-center">
                  PA <SortIcon field="pointsAgainst" />
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                onClick={() => handleSort("yardsFor")}
              >
                <div className="flex items-center">
                  Yards <SortIcon field="yardsFor" />
                </div>
              </th>
            </tr>
          </thead>

          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {sortedData.map(({ team, stats }) => (
              <tr key={team.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {team.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {team.abbreviation} {team.record && `(${team.record})`}
                      </div>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {team.division?.name || "N/A"}
                  </div>
                  {team.conference && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {team.conference.name}
                    </div>
                  )}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {stats?.wins ?? 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {stats?.losses ?? 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {stats?.winPercentage ? (stats.winPercentage * 100).toFixed(1) + "%" : "0%"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {stats?.pointsFor ?? 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {stats?.pointsAgainst ?? 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {stats?.yardsFor ?? 0}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sortedData.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            No team statistics available for {sport}.
          </p>
        </div>
      )}

    </div>
  );
}
