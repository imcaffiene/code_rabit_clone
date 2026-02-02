"use client";

import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Github, Flame, Calendar, TrendingUp } from 'lucide-react';
import { fetchContributions } from '@/github/actions';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';

// Constants
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Available years for selection
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 6 }, (_, i) => currentYear - i);

interface ContributionGraphProps {
  username?: string;
  avatarUrl?: string;
}



/**
 * GitHub-style contribution graph 
 * 
 */
export const ContributionGraph = ({ avatarUrl, username }: ContributionGraphProps) => {
  const [selectedYear, setSelectedYear] = useState(currentYear);

  // Fetch contribution data from GitHub
  const { data: calendar, isLoading, error } = useQuery({
    queryKey: ["github-contributions",selectedYear],
    queryFn: async () => await fetchContributions(selectedYear),
    staleTime: 1000 * 60 * 10,
    retry: 2,
  });

  // Helper function to determine activity level (0-4)
  function getLevel(count: number): 0 | 1 | 2 | 3 | 4 {
    if (count === 0) return 0;
    if (count <= 3) return 1;
    if (count <= 6) return 2;
    if (count <= 9) return 3;
    return 4;
  }

  // Transform GitHub data to full year calendar
  const activityData = useMemo(() => {
    if (!calendar) return [];

    // Create full year of dates (Jan 1 - Dec 31)
    const startOfYear = new Date(selectedYear, 0, 1);
    const endOfYear = new Date(selectedYear, 11, 31);

    const allDates: Array<{ date: string; count: number; level: 0 | 1 | 2 | 3 | 4; }> = [];

    // Create map of existing contributions
    const contributionMap = new Map(
      calendar.weeks.flatMap(week =>
        week.contributionDays
          .filter(day => new Date(day.date).getFullYear() === selectedYear)
          .map(day => [day.date, day])
      )
    );

    // Generate every day of the year
    let currentDate = new Date(startOfYear);
    while (currentDate <= endOfYear) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const contribution = contributionMap.get(dateStr);

      allDates.push({
        date: dateStr,
        count: contribution?.contributionCount || 0,
        level: getLevel(contribution?.contributionCount || 0),
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return allDates;
  }, [calendar, selectedYear]);

  // Calculate total contributions
  const totalContributions = useMemo(() =>
    activityData.reduce((sum, day) => sum + day.count, 0),
    [activityData]
  );

  // Calculate statistics
  const stats = useMemo(() => {
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let mostActiveDay = { date: '', count: 0 };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const reversedData = [...activityData]
      .filter(day => new Date(day.date) <= today)
      .reverse();

    let foundZero = false;
    reversedData.forEach((day) => {
      if (!foundZero && day.count > 0) {
        currentStreak++;
      } else if (day.count === 0) {
        foundZero = true;
      }
    });

    activityData.forEach((day) => {
      if (day.count > 0) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }

      if (day.count > mostActiveDay.count) {
        mostActiveDay = { date: day.date, count: day.count };
      }
    });

    return { currentStreak, longestStreak, mostActiveDay };
  }, [activityData]);

  // Group data by month
  const monthsData = useMemo(() => {
    const months: { month: number; days: typeof activityData; }[] = [];

    for (let month = 0; month < 12; month++) {
      const monthDays = activityData.filter(day => {
        const date = new Date(day.date);
        return date.getMonth() === month;
      });
      months.push({ month, days: monthDays });
    }

    return months;
  }, [activityData]);

  // Get color class based on activity level
  const getLevelColor = (level: number) => {
    switch (level) {
      case 0:
        return 'bg-muted/50 dark:bg-muted/30 border border-border/50';
      case 1:
        return 'bg-emerald-200 dark:bg-emerald-900/60';
      case 2:
        return 'bg-emerald-300 dark:bg-emerald-700/80';
      case 3:
        return 'bg-emerald-400 dark:bg-emerald-500';
      case 4:
        return 'bg-emerald-500 dark:bg-emerald-400';
      default:
        return 'bg-muted/50 dark:bg-muted/30 border border-border/50';
    }
  };

  // Format date for tooltip
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // === LOADING STATE ===
  if (isLoading) {
    return (
      <Card className="bg-card/50 border-border/50">
        <CardContent className="h-[400px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            <div className="text-sm text-muted-foreground">Loading contributions...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // === ERROR STATE ===
  if (error || !calendar) {
    return (
      <Card className="bg-card/50 border-border/50">
        <CardContent className="h-[400px] flex items-center justify-center">
          <div className="text-center">
            <p className="text-sm text-destructive">Failed to load contributions</p>
            <p className="text-xs text-muted-foreground mt-1">Please try again later</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // === MAIN RENDER ===
  return (
    <Card className="bg-card/50 border-border/50 overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={`${username || 'User'}'s GitHub avatar`}
                  width={40}
                  height={40}
                  className="rounded-full ring-2 ring-primary/20"
                  unoptimized
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-primary/20 ring-2 ring-primary/20 flex items-center justify-center">
                  <Github className="h-5 w-5" />
                </div>
              )}
              <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-card" />
            </div>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Github className="h-4 w-4" />
                {username ? `@${username}` : 'GitHub Activity'}
              </CardTitle>
              <CardDescription>
                {totalContributions.toLocaleString()} contributions in {selectedYear}
              </CardDescription>
            </div>
          </div>
          <Select
            value={selectedYear.toString()}
            onValueChange={(value) => setSelectedYear(parseInt(value))}
          >
            <SelectTrigger className="w-[100px] h-8 text-sm">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {YEARS.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
            <div className="p-2 rounded-md bg-orange-500/10">
              <Flame className="h-4 w-4 text-orange-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Current Streak</p>
              <p className="text-lg font-semibold">{stats.currentStreak} days</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
            <div className="p-2 rounded-md bg-primary/10">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Longest Streak</p>
              <p className="text-lg font-semibold">{stats.longestStreak} days</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
            <div className="p-2 rounded-md bg-emerald-500/10">
              <Calendar className="h-4 w-4 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Most Active</p>
              <p className="text-lg font-semibold">{stats.mostActiveDay.count} commits</p>
            </div>
          </div>
        </div>

        {/* Calendar Heatmap */}
        <div className="overflow-x-auto pb-2">
          <div className="min-w-[800px]">
            {/* Month Headers */}
            <div className="grid grid-cols-12 gap-1 mb-2">
              {MONTHS.map((month) => (
                <div key={month} className="text-xs font-medium text-muted-foreground text-center">
                  {month}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <TooltipProvider delayDuration={100}>
              <div className="grid grid-cols-12 gap-1">
                {monthsData.map(({ month, days }) => (
                  <div key={month} className="space-y-0.5">
                    {Array.from({ length: 7 }).map((_, dayOfWeek) => {
                      const daysOnWeekday = days.filter(d => new Date(d.date).getDay() === dayOfWeek);

                      return (
                        <div key={dayOfWeek} className="flex gap-0.5 h-[14px]">
                          {month === 0 && (
                            <span className="text-[10px] text-muted-foreground w-6 shrink-0 text-right pr-1">
                              {dayOfWeek % 2 === 1 ? DAYS[dayOfWeek].slice(0, 2) : ''}
                            </span>
                          )}
                          {daysOnWeekday.length > 0 ? (
                            daysOnWeekday.map((day) => (
                              <Tooltip key={day.date}>
                                <TooltipTrigger asChild>
                                  <div
                                    className={`h-[14px] w-[14px] rounded-sm ${getLevelColor(day.level)} 
                                      transition-all duration-150 hover:scale-125 hover:ring-1 hover:ring-foreground/30 cursor-pointer`}
                                  />
                                </TooltipTrigger>
                                <TooltipContent side="top" className="text-xs px-3 py-2">
                                  <p className="font-semibold">
                                    {day.count} contribution{day.count !== 1 ? 's' : ''}
                                  </p>
                                  <p className="text-muted-foreground">{formatDate(day.date)}</p>
                                </TooltipContent>
                              </Tooltip>
                            ))
                          ) : (
                            <div className="h-[14px] w-[14px]" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </TooltipProvider>

            {/* Legend */}
            <div className="flex items-center justify-end gap-2 mt-4 text-xs text-muted-foreground">
              <span>Less</span>
              <div className="flex gap-1">
                {[0, 1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={`h-[14px] w-[14px] rounded-sm ${getLevelColor(level)}`}
                  />
                ))}
              </div>
              <span>More</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
