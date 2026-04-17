"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import Link from "next/link";

export default function HistoryProfilePage() {
  const { user, loading } = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  return (
    <div className="bg-surface text-on-surface font-body min-h-screen pb-32 overflow-x-hidden">
      {/* TopNavBar */}

      <main className="max-w-4xl mx-auto pt-24 px-6">
        {/* Editorial Header */}
        <section className="mb-12">
          <h2 className="font-headline text-4xl font-extrabold tracking-tight text-primary mb-2">
            My History
          </h2>
          <p className="text-on-surface-variant font-medium">
            Review your digital greenhouse records and saved insights.
          </p>
        </section>

        {/* Diagnosis History Timeline */}
        <section className="mb-16">
          <div className="flex justify-between items-end mb-8">
            <h3 className="font-headline text-xl font-bold">
              Recent Diagnoses
            </h3>
            <span className="text-sm font-bold uppercase tracking-widest text-primary-container">
              Chronological View
            </span>
          </div>
          <div className="space-y-6">
            {/* Timeline Item 1 */}
            <div className="bg-surface-container-low p-5 rounded-lg flex items-center gap-6 group hover:bg-surface-container-high transition-colors">
              <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  className="w-full h-full object-cover"
                  alt="close-up of a vibrant green tomato leaf with healthy texture and clear veins in soft natural daylight"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBhEgnD1B4u3HwmHvIrSY3jXJkTdmVlRrb9Ee7MBJKmEZfsxpFD1Tj_veL3GdMb4rdkW4RZGNzDW-E-QBpsCWsiwRJqqAg-uu-3XKJ3sal5xV9JwESECSAhx_qXSrn9XnIEWPcHZVwrzJFFMQ2xdTWCH1FfkTQ3lvWMaibkx_U683_BPnsEGNjENOR0GhDGq84nCfD6Pw_Rv5rDQjBGRpBz_0d3f9Co6A37jmLwzA16gtYv8CYD-6CZOGaRNJeYdcN8bozeMrBnnTSr"
                />
              </div>
              <div className="flex-grow">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-headline text-lg font-bold text-on-surface">
                      Healthy Leaf
                    </h4>
                    <p className="text-sm text-on-surface-variant font-medium">
                      Tomato (Solanum lycopersicum)
                    </p>
                  </div>
                  <span className="text-xs font-bold font-label bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full uppercase">
                    Optimal
                  </span>
                </div>
                <div className="mt-4 flex items-center gap-2 text-primary font-semibold text-sm">
                  <span className="material-symbols-outlined text-base">
                    calendar_today
                  </span>
                  Oct 12, 2023
                </div>
              </div>
            </div>

            {/* Timeline Item 2 */}
            <div className="bg-surface-container-low p-5 rounded-lg flex items-center gap-6 group hover:bg-surface-container-high transition-colors">
              <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  className="w-full h-full object-cover"
                  alt="diseased potato leaf with large brown patches and yellow edges indicating late blight infection"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAayVsAZcbnRp2lDtMGau5ThMI9zJAYMwtMqe6rTyz6ibgwISQvWzBQlFHY1UAdK4Kb5f0YQs1DXxRPkYsMealUyd_YuzezucfVA6f2mRvsDGS8JK6R5gJBT3ASjm9eqW16HEqqvq5Vvb2VYixMMl5ILpmJCaY1blAg6FhT5PyHllT5Kcc2U-fVIQKl_Ww2EdynaH62nDjpANBhknjJLD78u7-NiJAAM57Grl4Mpr4MWhPkB-YxkyfgO5THP77AnlUedhvqC5g2KLqy"
                />
              </div>
              <div className="flex-grow">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-headline text-lg font-bold text-on-surface">
                      Late Blight
                    </h4>
                    <p className="text-sm text-on-surface-variant font-medium">
                      Potato (Solanum tuberosum)
                    </p>
                  </div>
                  <span className="text-xs font-bold font-label bg-error-container text-on-error-container px-3 py-1 rounded-full uppercase">
                    Critical
                  </span>
                </div>
                <div className="mt-4 flex items-center gap-2 text-primary font-semibold text-sm">
                  <span className="material-symbols-outlined text-base">
                    calendar_today
                  </span>
                  Oct 08, 2023
                </div>
              </div>
            </div>

            {/* Timeline Item 3 */}
            <div className="bg-surface-container-low p-5 rounded-lg flex items-center gap-6 group hover:bg-surface-container-high transition-colors">
              <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  className="w-full h-full object-cover"
                  alt="close-up of a corn leaf showing early signs of rust with tiny orange pustules across the surface"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCfpwG6FLgQyuO42y_fM3xCf4L-xulPtiGlzPh1yp9iUE8aRTLkJ53NoRjlwHjIQA4ERgAggAXS3fwcRfNIklewi1eHjtG_tuSWxjVahj1fsSAg__VwWmiFCcTIKKLVk-kjt9VH048NIrYQ9oxCeY1GAeeqT_rQfTKTWDWywBgQDkdDKs8RtQIAQohlGtxOcPb5T0ep5U4R6-qZf96AcCvZUMVOu37YyiU3nWNY4wtAKN9NLWOhrAeMrF-Q-Q6oSWYyooJjF9gzdNeA"
                />
              </div>
              <div className="flex-grow">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-headline text-lg font-bold text-on-surface">
                      Common Rust
                    </h4>
                    <p className="text-sm text-on-surface-variant font-medium">
                      Maize (Zea mays)
                    </p>
                  </div>
                  <span className="text-xs font-bold font-label bg-tertiary-container text-on-tertiary-container px-3 py-1 rounded-full uppercase">
                    Warning
                  </span>
                </div>
                <div className="mt-4 flex items-center gap-2 text-primary font-semibold text-sm">
                  <span className="material-symbols-outlined text-base">
                    calendar_today
                  </span>
                  Sep 29, 2023
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
