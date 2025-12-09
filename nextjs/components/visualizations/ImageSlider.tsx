"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ImageItem } from "@/lib/types";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface ImageSliderProps {
  images: ImageItem[];
  title?: string;
  description?: string;
}

export default function ImageSlider({
  images,
  title,
  description,
}: ImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isFullscreen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
      } else if (e.key === "ArrowRight") {
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
      } else if (e.key === "Escape") {
        setIsFullscreen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen, images.length]);

  if (images.length === 0) return null;

  const currentImage = images[currentIndex];

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6">
        {(title || description) && (
          <div className="mb-4">
            {title && (
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {description}
              </p>
            )}
          </div>
        )}

        {/* Main Image Display */}
        <div className="relative aspect-video bg-gray-100 dark:bg-gray-900 overflow-hidden mb-4 group">
          <Image
            src={currentImage.src}
            alt={currentImage.title}
            fill
            className="object-contain cursor-pointer"
            onClick={() => setIsFullscreen(true)}
            sizes="(max-width: 768px) 100vw, 80vw"
          />

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Image Counter */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 text-sm">
              {currentIndex + 1} / {images.length}
            </div>
          )}
        </div>

        {/* Image Info */}
        <div className="mb-4">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
            {currentImage.title}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {currentImage.description}
          </p>
        </div>

        {/* Thumbnail Navigation */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {images.map((image, index) => (
              <button
                key={image.id}
                onClick={() => goToSlide(index)}
                className={`relative flex-shrink-0 w-20 h-20 overflow-hidden border-2 transition-all ${
                  index === currentIndex
                    ? "border-blue-500"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                }`}
              >
                <Image
                  src={image.src}
                  alt={image.title}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </button>
            ))}
          </div>
        )}

        {/* Keyboard Navigation Hint */}
        {images.length > 1 && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
            Use arrow keys or click thumbnails to navigate
          </p>
        )}
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={() => setIsFullscreen(false)}
        >
          <div
            className="relative max-w-7xl max-h-[95vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-gray-900/80 hover:bg-gray-900 text-white"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="relative w-full h-[90vh] bg-gray-900">
              <Image
                src={currentImage.src}
                alt={currentImage.title}
                fill
                className="object-contain"
                priority
              />
            </div>

            {images.length > 1 && (
              <>
                <button
                  onClick={goToPrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black text-white p-3"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                  onClick={goToNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black text-white p-3"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </>
            )}

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2">
              <p className="font-semibold">{currentImage.title}</p>
              <p className="text-sm text-gray-300">
                {currentImage.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
