"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  backHref?: string;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  icon,
  actions,
  backHref,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
      <div>
        {backHref && (
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 type-caption text-neutral-500 hover:text-white mb-4 transition-colors duration-[var(--duration-fast)] ease-[var(--ease-premium)] focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)] rounded-sm"
          >
            <ArrowLeft size={14} /> Back
          </Link>
        )}
        {eyebrow && (
          <div className="flex items-center gap-2 type-overline text-red-400/80 mb-3">
            {icon}
            {eyebrow}
          </div>
        )}
        <h1 className="type-heading-xl text-white">
          {title}
        </h1>
        {description && (
          <p className="type-body-sm text-neutral-500 mt-3 prose-width-narrow">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
    </div>
  );
}
