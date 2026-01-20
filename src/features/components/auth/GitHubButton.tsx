import { EllipsisIcon } from "@/components/animate-ui/icons/ellipsis";
import { Button } from "@/components/animate-ui/primitives/buttons/button";
import { GithubIcon } from "@/components/ui/github";


interface GitHubButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  variant?: 'login' | 'signup';
}

export const GitHubButton = ({ onClick, isLoading, variant = 'login' }: GitHubButtonProps) => {
  return (
    <Button
      onClick={onClick}
      disabled={isLoading}
      className="w-full h-12 px-4 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 rounded-lg flex items-center justify-center cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        <EllipsisIcon animate className="mr-2 h-5 w-5 animate-spin" />
      ) : (
        <GithubIcon className="mr-2 h-5 w-5" />
      )}
      {variant === 'login' ? 'Continue with GitHub' : 'Sign up with GitHub'}
    </Button>
  );
};