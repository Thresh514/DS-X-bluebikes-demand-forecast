"use client";

import { useEffect, useState } from "react";

interface TOCItem {
  id: string;
  title: string;
  level: number;
}

interface TableOfContentsProps {
  items: TOCItem[];
  activeId?: string;
}

export default function TableOfContents({
  items,
  activeId,
}: TableOfContentsProps) {
  const [currentActive, setCurrentActive] = useState(activeId || "");

  useEffect(() => {
    const handleScroll = () => {
      const sections = items.map((item) => {
        const element = document.getElementById(item.id);
        if (element) {
          return {
            id: item.id,
            top: element.getBoundingClientRect().top,
          };
        }
        return null;
      });

      const visibleSections = sections
        .filter((s) => s && s.top >= 0 && s.top < 300)
        .sort((a, b) => (a?.top || 0) - (b?.top || 0));

      if (visibleSections.length > 0) {
        setCurrentActive(visibleSections[0]?.id || "");
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener("scroll", handleScroll);
  }, [items]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100; // Account for sticky header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
      setCurrentActive(id);
    }
  };

  return (
    <nav className="sticky top-24 h-[calc(100vh-8rem)] overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700">
        <h2 className="font-bold text-lg text-gray-900 dark:text-white mb-4">
          Table of Contents
        </h2>
        <ul className="space-y-1">
          {items.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => scrollToSection(item.id)}
                className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                  currentActive === item.id
                    ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
                style={{ paddingLeft: `${item.level * 0.75 + 0.75}rem` }}
              >
                {item.title}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
