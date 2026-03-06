"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Search, Star, GitFork, Check, ExternalLink } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import toast from "react-hot-toast";
import { fetchGitHubRepositoriesAction, importSingleRepository } from "../actions/importRepository";

interface ImportRepositoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportRepositoryModal({ open, onOpenChange }: ImportRepositoryModalProps) {
  const [search, setSearch] = useState("");
  const [importing, setImporting] = useState<number | null>(null);
  const queryClient = useQueryClient();

  // Reset search when dialog opens/closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setSearch(""); // Clear search when closing
    }
    onOpenChange(newOpen);
  };

  // Only fetch when modal opens
  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ['github-repositories'],
    queryFn: fetchGitHubRepositoriesAction, // Use action wrapper
    enabled: open,
    staleTime: 1000 * 60, // Cache for 1 minute
    gcTime: 1000 * 60 * 5, // Keep in cache for 5 minutes
  });

  const repos = data?.repos || [];

  const filteredRepos = repos.filter(repo =>
    repo.full_name.toLowerCase().includes(search.toLowerCase()) ||
    repo.description?.toLowerCase().includes(search.toLowerCase())
  );

  const handleImport = async (repoId: number, repoName: string) => {
    setImporting(repoId);

    try {
      const result = await importSingleRepository(repoId);

      if (result.success) {
        toast.success(`Imported ${repoName}`);

        // Optimistic update (instant UI feedback)
        queryClient.setQueryData(['github-repositories'], (old: any) => {
          if (!old) return old;
          return {
            ...old,
            repos: old.repos.map((r: any) =>
              r.id === repoId ? { ...r, isImported: true } : r
            ),
          };
        });

        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: ['repository-stats'] });
        queryClient.invalidateQueries({ queryKey: ['repositories'] });
      } else {
        toast.error(`Failed to import: ${result.error}`);
      }
    } catch (error) {
      toast.error("Failed to import repository");
    } finally {
      setImporting(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle>Import Repositories</DialogTitle>
          <DialogDescription>
            Select repositories from GitHub to import into CodeGuardian
          </DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="relative shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search repositories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-10"
          />
          {isFetching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          )}
        </div>

        {/* Repository List */}
        <ScrollArea className="h-[400px] pr-4">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8 text-destructive">
              Failed to load repositories
            </div>
          ) : filteredRepos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {search ? 'No repositories found' : 'No repositories available'}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredRepos.map((repo: any) => (
                <div
                  key={repo.id}
                  className="flex items-center justify-between gap-4 p-4 border border-border/50 rounded-lg hover:bg-accent/50 hover:border-border transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h3 className="font-semibold text-sm truncate">
                        {repo.full_name}
                      </h3>
                      {repo.private && (
                        <Badge variant="secondary" className="text-xs shrink-0">
                          Private
                        </Badge>
                      )}
                      {repo.language && (
                        <Badge variant="outline" className="text-xs shrink-0 gap-1">
                          <span className="w-2 h-2 rounded-full bg-blue-500" />
                          {repo.language}
                        </Badge>
                      )}
                      {repo.isImported && (
                        <Badge className="text-xs gap-1 shrink-0 bg-emerald-500/20 text-emerald-600 border-emerald-500/30">
                          <Check className="h-3 w-3" />
                          Imported
                        </Badge>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
                      {repo.description || 'No description'}
                    </p>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        {repo.stargazers_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <GitFork className="h-3 w-3" />
                        {repo.forks_count}
                      </span>
                      {repo.updated_at && (
                        <span className="text-xs">
                          Updated {new Date(repo.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      asChild
                    >
                      <a
                        href={repo.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Open on GitHub"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>

                    <Button
                      size="sm"
                      className="shrink-0"
                      onClick={() => handleImport(repo.id, repo.full_name)}
                      disabled={repo.isImported || importing === repo.id}
                    >
                      {importing === repo.id ? (
                        <>
                          <div className="h-3 w-3 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                          Importing
                        </>
                      ) : repo.isImported ? (
                        <>
                          <Check className="h-3 w-3 mr-1" />
                          Imported
                        </>
                      ) : (
                        "Import"
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          Showing {filteredRepos.length} of {repos.length} repositories
          {repos.filter((r: any) => r.isImported).length > 0 && (
            <> • {repos.filter((r: any) => r.isImported).length} already imported</>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
