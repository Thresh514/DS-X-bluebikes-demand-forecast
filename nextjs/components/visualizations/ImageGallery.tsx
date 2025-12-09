"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { filterImagesBySection } from "@/lib/visualizations-data";
import { ImageItem, SectionId } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { X } from "lucide-react";

interface ImageGalleryProps {
  section: SectionId;
}

export default function ImageGallery({ section }: ImageGalleryProps) {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);
  const [filterTag, setFilterTag] = useState<string>("");

  useEffect(() => {
    const allImages = filterImagesBySection(section);
    if (filterTag) {
      setImages(allImages.filter((img) => img.tags?.includes(filterTag)));
    } else {
      setImages(allImages);
    }
  }, [section, filterTag]);

  // Extract unique tags for current section
  const availableTags = Array.from(
    new Set(filterImagesBySection(section).flatMap((img) => img.tags || [])),
  ).sort();

  // Close modal on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedImage(null);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  return (
    <div className="space-y-4">
      {/* Filters */}
      {availableTags.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Filter:
          </span>
          <button
            onClick={() => setFilterTag("")}
            className={`px-3 py-1 rounded-full text-sm ${
              filterTag === ""
                ? "bg-blue-500 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            All ({filterImagesBySection(section).length})
          </button>
          {availableTags.slice(0, 10).map((tag) => (
            <button
              key={tag}
              onClick={() => setFilterTag(tag)}
              className={`px-3 py-1 rounded-full text-sm ${
                filterTag === tag
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Image Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {images.map((image) => (
          <Card
            key={image.id}
            className="cursor-pointer hover:shadow-lg transition-shadow group overflow-hidden"
            onClick={() => setSelectedImage(image)}
          >
            <CardContent className="p-0">
              <div className="relative aspect-video bg-gray-100 dark:bg-gray-800">
                <Image
                  src={image.src}
                  alt={image.title}
                  fill
                  className="object-contain group-hover:scale-105 transition-transform"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-1">
                  {image.title}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                  {image.description}
                </p>
                {image.tags && image.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {image.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {images.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No images found for the selected filters.
        </div>
      )}

      {/* Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative bg-white dark:bg-gray-800 rounded-lg max-w-6xl max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-gray-900/80 hover:bg-gray-900 text-white rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Image */}
            <div className="relative w-full min-h-[400px] bg-gray-100 dark:bg-gray-900">
              <Image
                src={selectedImage.src}
                alt={selectedImage.title}
                width={1200}
                height={800}
                className="w-full h-auto"
                priority
              />
            </div>

            {/* Details */}
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {selectedImage.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {selectedImage.description}
              </p>
              {selectedImage.tags && selectedImage.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedImage.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
