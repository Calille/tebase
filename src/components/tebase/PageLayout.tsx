import React, { useState } from "react";
import { cn } from "@/lib/utils";
import Sidebar from "@/components/tebase/Sidebar";

export type PageLayoutVariant = "padded" | "fill";

interface PageLayoutProps {
  title?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  /** padded: scrollable main with p-6. fill: header + flex child (dashboards). */
  variant?: PageLayoutVariant;
  contentClassName?: string;
  headerClassName?: string;
  className?: string;
}

const PageLayout: React.FC<PageLayoutProps> = ({
  title,
  actions,
  children,
  variant = "padded",
  contentClassName,
  headerClassName,
  className,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const showHeader = Boolean(title || actions);

  return (
    <div className={cn("flex h-screen bg-gray-100", className)}>
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((open) => !open)}
      />
      <main
        className={cn(
          "flex-1 transition-all duration-300",
          variant === "padded"
            ? "overflow-auto p-6"
            : "h-screen overflow-hidden",
          collapsed ? "ml-[70px]" : "ml-[50px]",
        )}
      >
        {variant === "padded" ? (
          <div className={cn("space-y-6", contentClassName)}>
            {showHeader && (
              <div className="flex items-center justify-between">
                {title ? (
                  <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
                ) : (
                  <span />
                )}
                {actions}
              </div>
            )}
            {children}
          </div>
        ) : (
          <div className="flex flex-col h-full w-full">
            {showHeader && (
              <div
                className={cn(
                  "flex items-center justify-between p-4 bg-gray-100",
                  headerClassName,
                )}
              >
                {title ? (
                  <h1 className="text-xl md:text-2xl font-bold text-gray-800">
                    {title}
                  </h1>
                ) : (
                  <span />
                )}
                {actions}
              </div>
            )}
            <div className={cn("flex-1 overflow-auto", contentClassName)}>
              {children}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default PageLayout;
