"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { allUnitDesigns, allPaymentPlans, saveRelease, generateUnits, getReleaseById } from "@/lib/mockData";
import { Release } from "@/lib/mockData";
import { Check, X, ArrowLeft } from "lucide-react";
import Link from "next/link";

const COMPOUND_OPTIONS = ["June", "Ogami", "The Estates"];

export default function EditReleasePageClient({ releaseId }: { releaseId: string }) {
  const router = useRouter();
  const existingRelease = releaseId ? getReleaseById(releaseId) : null;

  const [releaseName, setReleaseName] = useState("");
  const [compoundName, setCompoundName] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [selectedUnitDesignIds, setSelectedUnitDesignIds] = useState<Set<string>>(new Set());
  const [selectedPaymentPlanIds, setSelectedPaymentPlanIds] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Pre-populate form if editing
  useEffect(() => {
    if (existingRelease && typeof window !== "undefined") {
      // Batch state updates to avoid cascading renders
      requestAnimationFrame(() => {
        setReleaseName(existingRelease.releaseName);
        setCompoundName(existingRelease.compoundName);
        setReleaseDate(existingRelease.releaseDate);
        setSelectedUnitDesignIds(new Set(existingRelease.unitDesigns.map((d) => d.id)));
        setSelectedPaymentPlanIds(new Set(existingRelease.paymentPlans.map((p) => p.id)));
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUnitDesignToggle = (id: string) => {
    setSelectedUnitDesignIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handlePaymentPlanToggle = (id: string) => {
    setSelectedPaymentPlanIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!releaseName.trim() || !compoundName || !releaseDate) {
      alert("Please fill in all required fields");
      return;
    }

    if (selectedUnitDesignIds.size === 0 || selectedPaymentPlanIds.size === 0) {
      alert("Please select at least one unit design and one payment plan");
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedUnitDesigns = allUnitDesigns.filter((d) => selectedUnitDesignIds.has(d.id));
      const selectedPaymentPlans = allPaymentPlans.filter((p) => selectedPaymentPlanIds.has(p.id));

      // Generate units for selected unit designs
      const units = generateUnits(selectedUnitDesigns);

      // Create or update release
      const releaseData: Release = {
        id: existingRelease ? existingRelease.id : releaseName.toLowerCase().replace(/\s+/g, "-") + "-" + compoundName.toLowerCase().replace(/\s+/g, "-"),
        compoundName: compoundName.trim(),
        releaseName: releaseName.trim(),
        releaseDate: releaseDate,
        paymentPlans: selectedPaymentPlans,
        unitDesigns: selectedUnitDesigns,
        units,
      };

      // Save release
      saveRelease(releaseData);

      // Redirect to review page
      router.push(`/review/${releaseData.id}`);
    } catch (error) {
      console.error("Error updating release:", error);
      alert("Failed to update release. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!existingRelease) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Release Not Found</h1>
          <p className="text-gray-600 mb-4">The release you&apos;re trying to edit doesn&apos;t exist.</p>
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium cursor-pointer">
            <ArrowLeft className="w-5 h-5" />
            Back to Releases
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="h-screen flex flex-col">
        <div className="flex-1 overflow-y-auto px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <Link href="/" className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer text-gray-600 hover:text-gray-900" title="Back to releases" aria-label="Back to releases">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Edit Release</h1>
                  <p className="text-gray-600">Update the details for this release</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div className="space-y-4 mb-8">
                <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">Basic Information</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="releaseName" className="block text-sm font-medium text-gray-700 mb-2">
                      Release Name <span className="text-red-600">*</span>
                    </label>
                    <input type="text" id="releaseName" value={releaseName} onChange={(e) => setReleaseName(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g., Phase 1, Latest Release" />
                  </div>

                  <div>
                    <label htmlFor="compoundName" className="block text-sm font-medium text-gray-700 mb-2">
                      Compound Name <span className="text-red-600">*</span>
                    </label>
                    <div className="relative">
                      <select id="compoundName" value={compoundName} onChange={(e) => setCompoundName(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer bg-white pr-10">
                        <option value="">Select a compound</option>
                        {COMPOUND_OPTIONS.map((compound) => (
                          <option key={compound} value={compound}>
                            {compound}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="releaseDate" className="block text-sm font-medium text-gray-700 mb-2">
                      Release Date <span className="text-red-600">*</span>
                    </label>
                    <input type="date" id="releaseDate" value={releaseDate} onChange={(e) => setReleaseDate(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                </div>
              </div>

              {/* Unit Designs Selection */}
              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
                    Unit Designs
                    {selectedUnitDesignIds.size > 0 && <span className="ml-3 px-2.5 py-0.5 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">{selectedUnitDesignIds.size} selected</span>}
                  </h2>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="w-12 px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedUnitDesignIds.size === allUnitDesigns.length && allUnitDesigns.length > 0}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedUnitDesignIds(new Set(allUnitDesigns.map((d) => d.id)));
                                } else {
                                  setSelectedUnitDesignIds(new Set());
                                }
                              }}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                            />
                          </th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Bedrooms
                          </th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            BUA
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {allUnitDesigns.map((design) => (
                          <tr key={design.id} className={`hover:bg-gray-50 cursor-pointer transition-colors ${selectedUnitDesignIds.has(design.id) ? "bg-blue-50" : ""}`} onClick={() => handleUnitDesignToggle(design.id)}>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <input type="checkbox" checked={selectedUnitDesignIds.has(design.id)} onChange={() => handleUnitDesignToggle(design.id)} onClick={(e) => e.stopPropagation()} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer" />
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{design.name}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{design.beds === 0 ? "Studio" : `${design.beds} Bed${design.beds > 1 ? "s" : ""}`}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{design.bua} sqm</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Payment Plans Selection */}
              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
                    Payment Plans
                    {selectedPaymentPlanIds.size > 0 && <span className="ml-3 px-2.5 py-0.5 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">{selectedPaymentPlanIds.size} selected</span>}
                  </h2>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="w-12 px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedPaymentPlanIds.size === allPaymentPlans.length && allPaymentPlans.length > 0}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedPaymentPlanIds(new Set(allPaymentPlans.map((p) => p.id)));
                                } else {
                                  setSelectedPaymentPlanIds(new Set());
                                }
                              }}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                            />
                          </th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Down Payment
                          </th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Years
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {allPaymentPlans.map((plan) => (
                          <tr key={plan.id} className={`hover:bg-gray-50 cursor-pointer transition-colors ${selectedPaymentPlanIds.has(plan.id) ? "bg-blue-50" : ""}`} onClick={() => handlePaymentPlanToggle(plan.id)}>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <input type="checkbox" checked={selectedPaymentPlanIds.has(plan.id)} onChange={() => handlePaymentPlanToggle(plan.id)} onClick={(e) => e.stopPropagation()} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer" />
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{plan.name}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{plan.downPayment}%</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{plan.years}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                <Link href="/" className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium cursor-pointer">
                  Cancel
                </Link>
                <button type="submit" disabled={isSubmitting} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-all font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex-1">
                  {isSubmitting ? "Updating..." : "Update Release"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
