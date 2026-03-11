"use client";

import React from "react";
import { Smartphone, Tablet, Laptop, Monitor } from "lucide-react";
import { Button } from "../../app/components/ui/button";

export type PreviewWidth = "375px" | "768px" | "1024px" | "100%";

interface PreviewToolbarProps {
  currentWidth: PreviewWidth;
  onWidthChange: (width: PreviewWidth) => void;
}

const devices = [
  { id: "mobile", icon: Smartphone, width: "375px" as const, label: "Mobile (375px)" },
  { id: "tablet", icon: Tablet, width: "768px" as const, label: "Tablet (768px)" },
  { id: "laptop", icon: Laptop, width: "1024px" as const, label: "Laptop (1024px)" },
  { id: "desktop", icon: Monitor, width: "100%" as const, label: "Desktop (Full)" },
];

export const PreviewToolbar: React.FC<PreviewToolbarProps> = ({
  currentWidth,
  onWidthChange,
}) => {
  return (
    <div className="flex items-center justify-center gap-1 p-1.5 bg-zinc-100/50 dark:bg-zinc-800/50 rounded-lg border border-zinc-200/50 dark:border-zinc-700/50">
      {devices.map((device) => {
        const Icon = device.icon;
        const isActive = currentWidth === device.width;

        return (
          <Button
            key={device.id}
            variant={isActive ? "default" : "ghost"}
            size="sm"
            onClick={() => onWidthChange(device.width)}
            className={`h-8 w-8 p-0 rounded-md transition-all ${
              isActive 
                ? "shadow-sm" 
                : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            }`}
            title={device.label}
          >
            <Icon className="h-4 w-4" />
          </Button>
        );
      })}
      <div className="mx-2 h-4 w-px bg-zinc-300 dark:bg-zinc-600" />
      <span className="text-[10px] font-mono font-medium text-zinc-500 dark:text-zinc-400 min-w-[45px] text-center">
        {currentWidth === "100%" ? "Full" : currentWidth}
      </span>
    </div>
  );
};
