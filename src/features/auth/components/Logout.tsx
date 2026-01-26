'use client';
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export const useLogout = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const logout = async () => {
    if (loading) return;
    
    setLoading(true);
    
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            toast.success("Successfully signed out!");
            
            // Delay redirect to show toast
            setTimeout(() => {
              router.push('/');
              router.refresh();
            }, 1000); // 1 second delay
          },
          onError: (error) => {
            console.error('Logout failed:', error);
            toast.error("Failed to sign out. Please try again.");
            setLoading(false);
          }
        }
      });
    } catch (error) {
      console.error('Unexpected logout error:', error);
      toast.error("An unexpected error occurred");
      setLoading(false);
    }
  };

  return { logout, loading };
};
