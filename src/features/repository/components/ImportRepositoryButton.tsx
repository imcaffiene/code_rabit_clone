"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { ImportRepositoryModal } from "./ImportRepositoryModal";

export function ImportRepositoryButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="gap-2">
        <Plus className="h-4 w-4" />
        Import Repository
      </Button>

      <ImportRepositoryModal
        open={isOpen}
        onOpenChange={setIsOpen}
      />
    </>
  );
}
