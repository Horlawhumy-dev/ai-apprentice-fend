import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  badges,
  actions,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  badges?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-5 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && (
          <p className="eyebrow flex items-center gap-1.5">
            <span className="inline-block h-px w-6 bg-line-strong" />
            {eyebrow}
          </p>
        )}
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em] text-balance sm:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-[0.95rem] text-muted text-pretty">{description}</p>}
        {badges && <div className="mt-4 flex flex-wrap items-center gap-2">{badges}</div>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function PageShell({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  return (
    <main className={`mx-auto w-full ${wide ? "max-w-7xl" : "max-w-6xl"} px-5 py-10 sm:px-6 sm:py-14`}>
      {children}
    </main>
  );
}

export default PageShell;
