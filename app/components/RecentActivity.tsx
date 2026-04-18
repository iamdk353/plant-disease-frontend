import Link from "next/link";

const RecentActivity = () => {
  return (
    <section>
      <div className="flex items-center justify-between mb-6 px-2">
        <h2 className="text-xl font-bold tracking-tight font-headline">
          Recent Activity
        </h2>
        <Link
          href={"app/activities"}
          className="text-sm font-bold text-primary hover:underline"
        >
          View All
        </Link>
      </div>
      <div className="space-y-4">
        {/* Activity Item 1 */}
        <div className="flex items-center gap-6 p-4 bg-surface-container-low rounded-lg group hover:bg-surface-container-high transition-colors cursor-pointer">
          <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
            <img
              className="w-full h-full object-cover"
              alt="macro close-up of a green leaf with small yellow spots and veins visible under natural sunlight"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuByqQTqKasxHg_SND9dGu7TckC0j99WjavTrygJOyjDFiL8kpdlXmOTt1F_xLqdDVobGJUrPuBUn-qPnaN7B_iF7QvnSG8egTOriDc0Ij9MYAbxb99IbZKNVS93TNnhlpLrin8hDJoOBuM3KFyAgWR3Mi7i3I3rlHCH8TjCPeVTL_Lngpouc_uOrAxnbMXgdfEXzyuVjusKe-08hP626E7PtMAM-pkvoIZQQsVgDNQNW0DGzXd7GIj1DDiTCBxWVtvXYXj8R8YmpR9_"
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-full bg-error-container text-on-error-container text-[10px] font-bold uppercase tracking-wider">
                Warning
              </span>
              <span className="text-xs text-on-surface-variant font-medium">
                May 12, 09:45 AM
              </span>
            </div>
            <h4 className="font-bold text-lg text-on-surface">
              Tomato Early Blight
            </h4>
            <p className="text-sm text-on-surface-variant">
              Fungal infection detected in Sector A
            </p>
          </div>
          <span className="material-symbols-outlined text-on-surface-variant opacity-40 group-hover:opacity-100 transition-opacity">
            chevron_right
          </span>
        </div>

        {/* Activity Item 2 */}
        <div className="flex items-center gap-6 p-4 bg-surface-container-low rounded-lg group hover:bg-surface-container-high transition-colors cursor-pointer">
          <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
            <img
              className="w-full h-full object-cover"
              alt="fresh green potato plant growing in rich dark soil inside a sunlit commercial greenhouse"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCba3YNW70jgyRrrBiprHgaLyICIy01hDe4SdvBe0ZytU1XSu1OsiunA3vbm3Y9Gs6u6rWdQPntF7-Hy9yieD6l9XoH8vh8KiCIQ1j81iYSkLviYzJ2DzY6GOK4_wuQ8cFFJUOVHv_klb4KfRyx0uZO1eCYVTRDG64_22FKy3B5MUImrbuKZuAL6-MJWtL0Vc0p0UbCx2-kOXp5HBTBa_T9VsLKNSFoNUPf4Px1LEx7I-vvpX-RTANkihad45KKKqv087o0Bym4ZYyH"
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-bold uppercase tracking-wider">
                Healthy
              </span>
              <span className="text-xs text-on-surface-variant font-medium">
                May 10, 04:20 PM
              </span>
            </div>
            <h4 className="font-bold text-lg text-on-surface">
              Potato Foliage
            </h4>
            <p className="text-sm text-on-surface-variant">
              Optimal nutrient levels detected
            </p>
          </div>
          <span className="material-symbols-outlined text-on-surface-variant opacity-40 group-hover:opacity-100 transition-opacity">
            chevron_right
          </span>
        </div>
      </div>
    </section>
  );
};
export default RecentActivity;
