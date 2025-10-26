import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bluebikes Demand Forecast",
  description: "Bluebikes demand forecasting application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-50">
        {children}
      </body>
    </html>
  );
}
