"use client";

import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { UnitDesignMedia } from "@/lib/mockData";

interface MediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  media: UnitDesignMedia;
  unitName: string;
  bedrooms?: number;
  bua?: number;
  initialSection?: "offer" | "unit" | "floor";
  initialImageIndex?: number;
}

type MediaSection = "offer" | "unit" | "floor";

export default function MediaModal({
  isOpen,
  onClose,
  media,
  unitName,
  bedrooms,
  bua,
  initialSection,
  initialImageIndex,
}: MediaModalProps) {
  const [activeSection, setActiveSection] = useState<MediaSection>(initialSection || "floor");
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(initialImageIndex !== undefined ? initialImageIndex : 0);
  const [isAnimating, setIsAnimating] = useState(false);
  const hasHandledInitialLoad = useRef(false);
  const previousInitialSection = useRef<"offer" | "unit" | "floor" | undefined>(initialSection);
  const previousInitialImageIndex = useRef<number | undefined>(initialImageIndex);

  const sections = [
    { id: "floor" as MediaSection, label: "Floor Plans", images: media.floorPlans },
    { id: "offer" as MediaSection, label: "Offer Gallery", images: media.offerGallery },
    { id: "unit" as MediaSection, label: "Unit Gallery", images: media.unitGallery },
  ];

  const currentImages = sections.find((s) => s.id === activeSection)?.images || [];
  const currentImage = currentImages[currentImageIndex] || null;
  const currentSectionLabel = sections.find((s) => s.id === activeSection)?.label || "";

  const handlePrevious = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    } else {
      // If at first image, go to last image of previous section
      const currentSectionIndex = sections.findIndex((s) => s.id === activeSection);
      if (currentSectionIndex > 0) {
        const prevSection = sections[currentSectionIndex - 1];
        setActiveSection(prevSection.id);
        setCurrentImageIndex(prevSection.images.length - 1);
      } else {
        // Wrap around to last section's last image
        const lastSection = sections[sections.length - 1];
        setActiveSection(lastSection.id);
        setCurrentImageIndex(lastSection.images.length - 1);
      }
    }
  };

  const handleNext = () => {
    if (currentImageIndex < currentImages.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    } else {
      // If at last image, go to first image of next section
      const currentSectionIndex = sections.findIndex((s) => s.id === activeSection);
      if (currentSectionIndex < sections.length - 1) {
        const nextSection = sections[currentSectionIndex + 1];
        setActiveSection(nextSection.id);
        setCurrentImageIndex(0);
      } else {
        // Wrap around to first section's first image
        setActiveSection(sections[0].id);
        setCurrentImageIndex(0);
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      requestAnimationFrame(() => {
        setTimeout(() => setIsAnimating(true), 10);
      });
      
      // Set initial section when modal opens
      if (initialSection) {
        requestAnimationFrame(() => {
          setActiveSection(initialSection);
        });
      }
      
      // Set the image index AFTER a brief delay to ensure section is set first
      // Use setTimeout to ensure state updates happen in the right order
      requestAnimationFrame(() => {
        setTimeout(() => {
          if (initialImageIndex !== undefined) {
            setCurrentImageIndex(initialImageIndex);
          } else {
            setCurrentImageIndex(0);
          }
          // Mark that we've handled initial load AFTER setting the index
          hasHandledInitialLoad.current = true;
        }, 0);
      });
      
      // Update refs immediately
      previousInitialSection.current = initialSection;
      previousInitialImageIndex.current = initialImageIndex;
    } else {
      document.body.style.overflow = "unset";
      requestAnimationFrame(() => {
        setIsAnimating(false);
      });
      hasHandledInitialLoad.current = false;
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, initialSection, initialImageIndex]);

  useEffect(() => {
    // Only reset to first image when section changes manually (user clicks section tabs)
    // Don't reset if we're in the process of handling initial load
    if (isOpen && hasHandledInitialLoad.current) {
      // If section changed but it's not the initial section we opened with, reset to 0
      // This handles user manually clicking section tabs after opening
      if (initialSection !== undefined && activeSection !== initialSection) {
        setCurrentImageIndex(0);
      }
    }
  }, [activeSection, isOpen, initialSection]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        handlePrevious();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, currentImageIndex, currentImages.length, activeSection]);

  const handleSectionClick = (section: MediaSection) => {
    setActiveSection(section);
    setCurrentImageIndex(0);
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-[10000] bg-black transition-opacity duration-300 ${
        isAnimating ? "opacity-100" : "opacity-0"
      }`}
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        margin: 0,
        padding: 0
      }}
      onClick={onClose}
    >
      <div
        className="relative flex flex-col cursor-default"
        style={{ 
          width: '100%',
          height: '100%',
          minHeight: '100vh',
          margin: 0,
          padding: 0
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/90 via-black/80 to-transparent px-6 pt-4 pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <h2 className="text-xl font-bold text-white">{unitName}</h2>
                {(bedrooms !== undefined || bua !== undefined) && (
                  <div className="flex items-center gap-2.5">
                    {bedrooms !== undefined && (
                      <span className="px-4 py-2 bg-white/15 backdrop-blur-sm rounded-lg text-sm font-semibold text-white border border-white/25 shadow-sm">
                        {bedrooms} {bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}
                      </span>
                    )}
                    {bua !== undefined && (
                      <span className="px-4 py-2 bg-white/15 backdrop-blur-sm rounded-lg text-sm font-semibold text-white border border-white/25 shadow-sm">
                        BUA {bua} sqm
                      </span>
                    )}
                  </div>
                )}
              </div>
              {/* Section Tabs */}
              <div className="flex gap-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => handleSectionClick(section.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      activeSection === section.id
                        ? "bg-blue-600 text-white"
                        : "bg-white/20 text-white hover:bg-white/30"
                    }`}
                  >
                    {section.label}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={onClose}
              className="hover:bg-white/20 rounded-full transition-colors cursor-pointer text-white flex items-center justify-center"
              aria-label="Close"
              style={{ width: '2rem', height: '2rem', padding: '0.5rem' }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Image Display */}
        {currentImage && (
          <div className="flex-1 flex items-center justify-center relative pt-16 pb-16">
            {/* Previous Button */}
            <button
              onClick={handlePrevious}
              className="absolute left-4 z-10 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all cursor-pointer backdrop-blur-sm"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Image */}
            <div className="relative w-full h-full flex items-center justify-center px-4">
              <img
                src={currentImage}
                alt={`${currentSectionLabel} ${currentImageIndex + 1}`}
                className="max-w-[98vw] max-h-[calc(100vh-140px)] w-auto h-auto object-contain"
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

            {/* Next Button */}
            <button
              onClick={handleNext}
              className="absolute right-4 z-10 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all cursor-pointer backdrop-blur-sm"
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        )}

        {/* Thumbnail Strip */}
        {currentImages.length > 1 && (
          <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/90 via-black/80 to-transparent px-6 pt-6 pb-4">
            <div className="flex gap-2 justify-center mb-3">
              {currentImages.map((imageUrl, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 cursor-pointer ${
                    index === currentImageIndex
                      ? "border-blue-500 ring-2 ring-blue-400 scale-110"
                      : "border-white/30 hover:border-white/60"
                  }`}
                >
                  <img
                    src={imageUrl}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      const fallback = 'https://picsum.photos/seed/999/64/64';
                      if (!target.dataset.fallbackUsed) {
                        target.dataset.fallbackUsed = 'true';
                        target.src = fallback;
                      }
                    }}
                  />
                  {index === currentImageIndex && (
                    <div className="absolute inset-0 bg-blue-500/20" />
                  )}
                </button>
              ))}
            </div>
            {/* Image Counter */}
            {currentImages.length > 0 && (
              <div className="text-center mb-3">
                <div className="text-white text-sm font-medium">
                  {currentImageIndex + 1} / {currentImages.length}
                </div>
              </div>
            )}
            {/* Bottom Info Bar */}
            <div className="flex items-center justify-between text-white text-xs pb-1">
              <div className="font-medium">{currentSectionLabel}</div>
              <div className="text-white/70">
                Arrow keys to navigate • ESC to close
              </div>
            </div>
          </div>
        )}

        {/* Bottom Info Bar (when no thumbnails) */}
        {currentImages.length <= 1 && (
          <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 to-transparent px-6 py-3">
            <div className="flex items-center justify-between text-white text-xs">
              <div className="font-medium">{currentSectionLabel}</div>
              <div className="text-white/70">
                Arrow keys to navigate • ESC to close
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
