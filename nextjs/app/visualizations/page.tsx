"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Home, Map } from "lucide-react";
import TableOfContents from "@/components/visualizations/TableOfContents";
import BlogContent from "@/components/visualizations/BlogContent";

const tocItems = [
  { id: "introduction", title: "Introduction", level: 0 },
  { id: "data-exploration", title: "Data Exploration", level: 0 },
  { id: "time-series", title: "Time Series", level: 0 },
  { id: "models", title: "Model Results", level: 0 },
  { id: "poisson-model", title: "Poisson", level: 1 },
  { id: "nb-boosting", title: "NB + Boosting", level: 1 },
  { id: "zinb-model", title: "ZINB", level: 1 },
  { id: "comparison", title: "Comparison", level: 0 },
];

export default function VisualizationsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              aria-label="Back to home"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Back</span>
            </button>
            <div className="flex gap-2 ml-auto">
              <button
                onClick={() => router.push("/")}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Home"
              >
                <Home className="w-4 h-4" />
                <span>Home</span>
              </button>
              <button
                onClick={() => router.push("/map")}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Map view"
              >
                <Map className="w-4 h-4" />
                <span>Map</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout: Sidebar + Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[250px,1fr] gap-8">
          {/* Left Sidebar - Table of Contents */}
          <aside className="hidden lg:block">
            <TableOfContents items={tocItems} />
          </aside>

          {/* Main Content - Blog Style */}
          <main className="min-w-0">
            <BlogContent />
          </main>
        </div>
      </div>

      {/* Mobile TOC - Collapsible */}
      <div className="lg:hidden fixed bottom-4 right-4 z-30">
        <details className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 max-h-[60vh] overflow-y-auto">
          <summary className="font-semibold text-gray-900 dark:text-white cursor-pointer">
            Table of Contents
          </summary>
          <nav className="mt-4 space-y-1">
            {tocItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  const element = document.getElementById(item.id);
                  if (element) {
                    const offset = 100;
                    const elementPosition = element.getBoundingClientRect().top;
                    const offsetPosition =
                      elementPosition + window.pageYOffset - offset;
                    window.scrollTo({
                      top: offsetPosition,
                      behavior: "smooth",
                    });
                  }
                }}
                className="block w-full text-left px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                style={{ paddingLeft: `${item.level * 0.75 + 0.75}rem` }}
              >
                {item.title}
              </button>
            ))}
          </nav>
        </details>
      </div>
    </div>
  );
}
