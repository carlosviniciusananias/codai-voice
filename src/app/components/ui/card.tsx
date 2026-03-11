import * as React from "react";

export type CardProps = React.HTMLAttributes<HTMLDivElement>;

export function Card({ className = "", ...props }: CardProps) {
  return (
    <section
      className={[
        "rounded-2xl border border-zinc-200 bg-white/80 p-6 shadow-sm backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}

export type CardHeaderProps = React.HTMLAttributes<HTMLDivElement>;

export function CardHeader({ className = "", ...props }: CardHeaderProps) {
  return (
    <header
      className={["mb-4 flex items-center justify-between gap-2", className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}

export type CardTitleProps = React.HTMLAttributes<HTMLHeadingElement>;

export function CardTitle({ className = "", ...props }: CardTitleProps) {
  return (
    <h2
      className={[
        "text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 mr-2",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}

export type CardContentProps = React.HTMLAttributes<HTMLDivElement>;

export function CardContent({ className = "", ...props }: CardContentProps) {
  return (
    <div
      className={["text-sm text-zinc-700 dark:text-zinc-200", className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}

