"use client";

import { useState, useRef } from "react";
import { UnitDesignMedia } from "@/lib/mockData";

interface MediaPreviewProps {
  media: UnitDesignMedia;
  onClick?: (section?: "offer" | "unit" | "floor", imageIndex?: number) => void;
  maxImages?: number;
  showSections?: boolean;
  compact?: boolean;
  showAll?: boolean;
}

export default function MediaPreview({ 
  media, 
  onClick,
  maxImages = 8,
  showSections = true,
  compact = false,
  showAll = false
}: MediaPreviewProps) {
  const [hoveredImage, setHoveredImage] = useState<{ url: string; x: number; y: number; section: string } | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Group images by section with labels
  const sections = [
    { name: "Floor", images: media.floorPlans, color: "bg-green-500", textColor: "text-green-600" },
    { name: "Offer", images: media.offerGallery, color: "bg-blue-500", textColor: "text-blue-600" },
    { name: "Unit", images: media.unitGallery, color: "bg-purple-500", textColor: "text-purple-600" },
  ];

  // Calculate how many images per section to show
  const totalImages = sections.reduce((sum, section) => sum + section.images.length, 0);
  let remainingSlots = maxImages;
  
  const previewData: Array<{ url: string; section: string; sectionLabel: string; sectionColor: string }> = [];
  
  sections.forEach((section) => {
    const imagesToShow = Math.min(
      section.images.length,
      Math.ceil((section.images.length / totalImages) * maxImages) || Math.floor(remainingSlots / (sections.length - sections.indexOf(section)))
    );
    const actualImagesToShow = Math.min(imagesToShow, remainingSlots);
    
    for (let i = 0; i < actualImagesToShow && remainingSlots > 0; i++) {
      previewData.push({
        url: section.images[i % section.images.length],
        section: section.name.toLowerCase(),
        sectionLabel: section.name,
        sectionColor: section.textColor,
      });
      remainingSlots--;
    }
  });

  // Fill remaining slots if any
  if (remainingSlots > 0) {
    sections.forEach((section) => {
      for (let i = 0; i < remainingSlots && section.images.length > 0; i++) {
        previewData.push({
          url: section.images[i % section.images.length],
          section: section.name.toLowerCase(),
          sectionLabel: section.name,
          sectionColor: section.textColor,
        });
        remainingSlots--;
      }
    });
  }

  const handleMouseEnter = (e: React.MouseEvent, url: string, section: string) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    const rect = e.currentTarget.getBoundingClientRect();
    hoverTimeoutRef.current = setTimeout(() => {
      // Increase image quality for hover preview - convert seed-based URL
      const highQualityUrl = url.replace('/400/400', '/1200/800');
      setHoveredImage({
        url: highQualityUrl,
        x: rect.left + rect.width / 2,
        y: rect.top,
        section,
      });
    }, 1500);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setHoveredImage(null);
  };

  const gridCols = "grid-cols-4";
  const imageSize = compact ? "w-10 h-10" : "aspect-square";

  return (
    <>
      {showSections ? (
        <div className="space-y-2">
          {sections.map((section, sectionIndex) => {
            if (section.images.length === 0) return null;
            // If showAll is true, show all images. Otherwise, limit based on maxImages
            const sectionImages = showAll ? section.images : section.images.slice(0, compact ? 4 : Math.max(2, Math.floor(maxImages / sections.length)));
            
            return (
              <div key={sectionIndex} className="space-y-1">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-semibold text-gray-900">
                    {section.name === "Offer" ? "Offer Gallery" : section.name === "Unit" ? "Unit Gallery" : "Floor Plans"}
                  </span>
                  <span className="text-xs text-gray-500">({section.images.length})</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {sectionImages.map((imageUrl, imgIndex) => {
                    const sectionKey = section.name.toLowerCase() as "offer" | "unit" | "floor";
                    return (
                      <div
                        key={`${sectionIndex}-${imgIndex}`}
                        className={`relative ${showAll ? 'w-16 h-16' : imageSize} bg-gray-100 rounded overflow-hidden flex-shrink-0 ${onClick ? 'cursor-pointer' : ''}`}
                        onMouseEnter={(e) => handleMouseEnter(e, imageUrl, section.name)}
                        onMouseLeave={handleMouseLeave}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onClick) {
                            onClick(sectionKey, imgIndex);
                          }
                        }}
                      >
                        <img
                          src={imageUrl}
                          alt={`${section.name} Gallery ${imgIndex + 1}`}
                          className="w-full h-full object-cover hover:opacity-90 transition-opacity"
                          loading="lazy"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            const fallback = 'https://picsum.photos/seed/999/400/400';
                            if (!target.dataset.fallbackUsed) {
                              target.dataset.fallbackUsed = 'true';
                              target.src = fallback;
                            }
                          }}
                          onLoad={() => {
                            // Image loaded successfully
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className={`grid ${gridCols} gap-1`}>
          {previewData.map((item, index) => {
            const sectionKey = item.section as "offer" | "unit" | "floor";
            // Find the original index within the section
            const section = sections.find(s => s.name.toLowerCase() === item.section);
            const sectionImageIndex = section ? section.images.indexOf(item.url) : 0;
            return (
              <div
                key={`preview-${index}`}
                className={`relative ${imageSize} bg-gray-100 rounded overflow-hidden ${onClick ? 'cursor-pointer' : ''}`}
                onMouseEnter={(e) => handleMouseEnter(e, item.url, item.section)}
                onMouseLeave={handleMouseLeave}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onClick) {
                    onClick(sectionKey, sectionImageIndex >= 0 ? sectionImageIndex : 0);
                  }
                }}
              >
                <img
                  src={item.url}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover hover:opacity-90 transition-opacity"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    const fallback = 'https://picsum.photos/400/400?random=999';
                    if (!target.dataset.fallbackUsed) {
                      target.dataset.fallbackUsed = 'true';
                      target.src = fallback;
                    }
                  }}
                  onLoad={() => {
                    // Image loaded successfully
                  }}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Full Quality Image Tooltip with Section Label */}
      {hoveredImage && (
        <div
          className="fixed z-[60] pointer-events-none"
          style={{
            left: `${hoveredImage.x}px`,
            top: `${hoveredImage.y - 10}px`,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="relative w-[600px] h-[400px] rounded-lg shadow-2xl overflow-hidden">
            <div className="absolute top-3 left-3 z-10 bg-gray-900/80 text-white text-xs font-semibold px-3 py-1.5 rounded-md backdrop-blur-sm">
              {hoveredImage.section === "Offer" ? "Offer Gallery" : hoveredImage.section === "Unit" ? "Unit Gallery" : "Floor Plans"}
            </div>
            <img
              src={hoveredImage.url}
              alt="Full quality preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                const fallback = 'https://picsum.photos/seed/999/1200/800';
                if (!target.dataset.fallbackUsed) {
                  target.dataset.fallbackUsed = 'true';
                  target.src = fallback;
                }
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}

