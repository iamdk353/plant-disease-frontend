import Link from "next/link";

export default function Home() {
  return (
    <>
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 glass-nav bg-[#f6faf4]/80">
        <div className="flex justify-between items-center px-8 py-4 max-w-7xl mx-auto">
          <div className="text-2xl font-bold text-[#486808] font-headline tracking-tight">
            AgriAI
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a
              className="text-[#486808] font-headline tracking-tight font-bold border-b-2 border-[#486808] pb-1"
              href="#"
            >
              Features
            </a>
            <a
              className="text-[#181d19]/70 hover:text-[#486808] font-headline tracking-tight font-semibold transition-colors"
              href="#"
            >
              Advisory
            </a>
            <a
              className="text-[#181d19]/70 hover:text-[#486808] font-headline tracking-tight font-semibold transition-colors"
              href="#"
            >
              Pricing
            </a>
            <a
              className="text-[#181d19]/70 hover:text-[#486808] font-headline tracking-tight font-semibold transition-colors"
              href="#"
            >
              Community
            </a>
          </div>
          <div className="flex items-center gap-4">
            <button className="hidden md:block px-6 py-2 text-[#486808] font-semibold hover:bg-[#f1f5ef] rounded-full transition-all duration-200">
              Login
            </button>
            <Link href="/auth/signup" className="px-6 py-3 signature-gradient text-on-primary font-bold rounded-full transition-all active:scale-95 duration-200">
              Get Started
            </Link>
          </div>
        </div>
      </nav>
      <main className="pt-24">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-8 py-12 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 order-2 lg:order-1">
              <h1 className="text-5xl md:text-7xl font-headline font-extrabold text-on-surface leading-tight tracking-tighter">
                Your plants, <br />
                <span className="text-primary italic">nurtured</span> by AI.
              </h1>
              <p className="text-xl md:text-2xl text-on-surface-variant max-w-xl leading-relaxed">
                Transform your farming with real-time digital insights. Monitor
                health, predict yields, and grow smarter.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="px-8 py-5 signature-gradient text-on-primary text-xl font-bold rounded-full soft-shadow active:scale-95 transition-all">
                  Start Your Free Trial
                </button>
                <button className="flex items-center justify-center gap-2 px-8 py-5 bg-surface-container-low text-primary text-xl font-bold rounded-full hover:bg-surface-container-high transition-all">
                  <span
                    className="material-symbols-outlined"
                    data-icon="play_circle"
                  >
                    play_circle
                  </span>
                  Watch Demo
                </button>
              </div>
              <div className="flex items-center gap-4 pt-4">
                <div className="flex -space-x-3">
                  <div className="w-10 h-10 rounded-full bg-primary-fixed border-2 border-surface"></div>
                  <div className="w-10 h-10 rounded-full bg-secondary-fixed border-2 border-surface"></div>
                  <div className="w-10 h-10 rounded-full bg-tertiary-fixed border-2 border-surface"></div>
                </div>
                <p className="text-sm font-semibold text-on-surface-variant">
                  Trusted by 2,000+ modern farmers
                </p>
              </div>
            </div>
            <div className="relative order-1 lg:order-2">
              <div className="absolute -top-12 -right-12 w-64 h-64 bg-primary-container/20 rounded-full blur-3xl"></div>
              <div className="relative z-10 rounded-xl overflow-hidden soft-shadow bg-surface-container-low">
                <img
                  alt="Modern sustainable greenhouse"
                  className="w-full h-[500px] object-cover"
                  data-alt="Interior of a lush modern greenhouse with glass walls and advanced irrigation systems bathed in soft natural morning light"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDBUMntyAhSbM89rE53o9XmO02K_S_4sDHVnLtWEWx5LR7V2ezwFyMPCvyb73-7f94KlKfqd_pjOvjqGS-QFpPJ0v7vhF9oC6-H14IIOztfCqYH3sGQKhMH2myauh6xuB5Nv-MncvH8DHo463vZ7IHjvuX2SKyVzDaXnaeqexwtTKFzth2YVyC1dH3o5xvh2cWPkmHsX6ZzoKDcpM3fiT8RiKniUOLGy_CA2zekFI7FLPlaZQHX-CMJqY1jfJyfp3VwafRGQIFsrqNE"
                />
                <div className="absolute bottom-6 left-6 right-6 p-6 glass-nav bg-white/60 rounded-lg flex items-center gap-4">
                  <div className="p-3 bg-primary rounded-full text-on-primary">
                    <span
                      className="material-symbols-outlined"
                      data-icon="energy_savings_leaf"
                    >
                      energy_savings_leaf
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                      Live Status
                    </p>
                    <p className="text-lg font-bold text-on-surface">
                      Optimal Growth Environment
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Features Bento Grid */}
        <section className="bg-surface-container-low py-24">
          <div className="max-w-7xl mx-auto px-8">
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
              <div className="max-w-2xl">
                <h2 className="text-4xl md:text-5xl font-headline font-bold text-on-surface mb-6">
                  Designed for the field.
                </h2>
                <p className="text-xl text-on-surface-variant">
                  Simple tools built for real conditions. No complex jargon,
                  just actionable growth data.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature Card 1 */}
              <div className="md:col-span-2 bg-surface-container-lowest p-10 rounded-lg flex flex-col md:flex-row gap-10 items-center soft-shadow group">
                <div className="flex-1 space-y-6">
                  <div className="w-16 h-16 bg-primary-fixed rounded-full flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <span
                      className="material-symbols-outlined text-4xl"
                      data-icon="biotech"
                    >
                      biotech
                    </span>
                  </div>
                  <h3 className="text-3xl font-headline font-bold text-on-surface">
                    ML Disease Detection
                  </h3>
                  <p className="text-lg text-on-surface-variant leading-relaxed">
                    Simply point your camera. Our AI identifies over 200 plant
                    diseases instantly and provides organic treatment solutions.
                  </p>
                  <a
                    className="inline-flex items-center gap-2 text-primary font-bold text-lg"
                    href="#"
                  >
                    Learn more
                    <span
                      className="material-symbols-outlined"
                      data-icon="arrow_forward"
                    >
                      arrow_forward
                    </span>
                  </a>
                </div>
                <div className="flex-1">
                  <img
                    alt="AI identifying leaf spots"
                    className="rounded-lg w-full h-64 object-cover shadow-inner"
                    data-alt="Close up of a hand holding a smartphone scanning a green leaf with small brown spots, showing an AI overlay interface"
                    src="/ml-disease.png"
                  />
                </div>
              </div>
              {/* Feature Card 2 */}
              <div className="bg-primary p-10 rounded-lg flex flex-col justify-between text-on-primary soft-shadow">
                <div className="space-y-6">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                    <span
                      className="material-symbols-outlined text-4xl"
                      data-icon="psychology"
                    >
                      psychology
                    </span>
                  </div>
                  <h3 className="text-3xl font-headline font-bold">
                    Personalized Crop Advisory
                  </h3>
                  <p className="text-lg opacity-90 leading-relaxed">
                    Get a custom planting schedule based on your soil type and
                    local weather patterns.
                  </p>
                </div>
                <button className="mt-8 w-full py-4 bg-white text-primary font-bold rounded-full">
                  Explore Advisory
                </button>
              </div>
              {/* Feature Card 3 */}
              <div className="bg-surface-container-lowest p-10 rounded-lg space-y-6 soft-shadow border-t-4 border-tertiary">
                <div className="w-16 h-16 bg-tertiary/10 rounded-full flex items-center justify-center text-tertiary">
                  <span
                    className="material-symbols-outlined text-4xl"
                    data-icon="water_drop"
                  >
                    water_drop
                  </span>
                </div>
                <h3 className="text-2xl font-headline font-bold text-on-surface">
                  Smart Irrigation
                </h3>
                <p className="text-lg text-on-surface-variant">
                  Automated watering schedules that save up to 40% more water
                  than manual systems.
                </p>
              </div>
              {/* Feature Card 4 */}
              <div className="md:col-span-2 bg-secondary-container p-10 rounded-lg flex items-center justify-between gap-8 soft-shadow overflow-hidden relative">
                <div className="relative z-10 max-w-md">
                  <h3 className="text-2xl font-headline font-bold text-on-secondary-container mb-4">
                    Farmer Community
                  </h3>
                  <p className="text-lg text-on-secondary-container/80">
                    Connect with thousands of local experts to share seeds,
                    tools, and expertise.
                  </p>
                </div>
                <div className="hidden md:block">
                  <span
                    className="material-symbols-outlined text-[120px] text-on-secondary-container/10 absolute -right-4 -bottom-4"
                    data-icon="groups"
                  >
                    groups
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Testimonial Section */}
        <section className="py-24 max-w-7xl mx-auto px-8">
          <div className="bg-surface-container-lowest rounded-xl p-12 md:p-20 relative overflow-hidden soft-shadow">
            <div className="absolute top-0 right-0 p-12 opacity-5">
              <span
                className="material-symbols-outlined text-9xl"
                data-icon="format_quote"
              >
                format_quote
              </span>
            </div>
            <div className="relative z-10 flex flex-col md:flex-row gap-12 items-center">
              <div className="w-48 h-48 md:w-64 md:h-64 flex-shrink-0">
                <img
                  alt="Happy Farmer"
                  className="w-full h-full object-cover rounded-xl shadow-lg"
                  data-alt="Portrait of a smiling middle-aged farmer in a denim shirt standing in a sunlit vegetable field at dusk"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuB6LcAYUID6wk52zg-zORiF4aFa0mHiI1z-X782M0jnnV46VpUMl-qf_D54gc-RcnJvYLW1BvWjy58dovhnwkkOimgYdiOXBKuXrFcnxRwILC8Ou6TB6QArnQjZ6EXJqKs0gL0ZPzvIGJ1XAM0Fq2BzoGCv3Cn2ttn1JErLKtiHcCohAxDB64RoVnHjAi5z8fzaf4gXEj-gpAsxupcTCHOhnSpwoBnRoI4O8yo1-o87kA9GYxc-hUP9PQX92PdryanZI5C1FSnhQ14t"
                />
              </div>
              <div className="space-y-6">
                <div className="flex gap-1 text-primary">
                  <span
                    className="material-symbols-outlined"
                    data-icon="star"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    star
                  </span>
                  <span
                    className="material-symbols-outlined"
                    data-icon="star"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    star
                  </span>
                  <span
                    className="material-symbols-outlined"
                    data-icon="star"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    star
                  </span>
                  <span
                    className="material-symbols-outlined"
                    data-icon="star"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    star
                  </span>
                  <span
                    className="material-symbols-outlined"
                    data-icon="star"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    star
                  </span>
                </div>
                <p className="text-2xl md:text-4xl font-headline font-medium text-on-surface leading-tight italic">
                  &quot;AgriAI saved my tomato crop this season. The disease
                  detection picked up blight before I even noticed the spots.
                  It&apos;s like having a botanist in my pocket.&quot;
                </p>
                <div>
                  <p className="text-xl font-bold text-on-surface">
                    Thomas Miller
                  </p>
                  <p className="text-on-surface-variant font-medium">
                    Organic Greenhouse Farmer, Ohio
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Call to Action */}
        <section className="py-24 px-8">
          <div className="max-w-5xl mx-auto text-center space-y-10">
            <h2 className="text-4xl md:text-6xl font-headline font-extrabold text-on-surface">
              Ready to watch your harvest thrive?
            </h2>
            <p className="text-xl text-on-surface-variant max-w-2xl mx-auto">
              Join the future of farming. No credit card required to start your
              14-day free trial.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-10 py-5 signature-gradient text-on-primary text-2xl font-bold rounded-full soft-shadow active:scale-95 transition-all">
                Get Started for Free
              </button>
              <button className="px-10 py-5 bg-surface-container-high text-on-surface text-2xl font-bold rounded-full hover:bg-surface-variant transition-all">
                Talk to Support
              </button>
            </div>
          </div>
        </section>
      </main>
      {/* Footer */}
      <footer className="bg-[#f1f5ef] w-full py-12 px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 max-w-7xl mx-auto">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="font-manrope font-bold text-2xl text-[#181d19]">
              AgriAI
            </div>
            <p className="text-[#181d19]/60 font-inter text-sm tracking-wide">
              © 2024 AgriAI Greenhouse. Nurturing digital growth.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            <a
              className="text-[#181d19]/60 hover:text-[#486808] font-inter text-sm tracking-wide transition-colors"
              href="#"
            >
              Privacy Policy
            </a>
            <a
              className="text-[#181d19]/60 hover:text-[#486808] font-inter text-sm tracking-wide transition-colors"
              href="#"
            >
              Terms of Service
            </a>
            <a
              className="text-[#181d19]/60 hover:text-[#486808] font-inter text-sm tracking-wide transition-colors"
              href="#"
            >
              Farmer Support
            </a>
            <a
              className="text-[#181d19]/60 hover:text-[#486808] font-inter text-sm tracking-wide transition-colors"
              href="#"
            >
              Contact Us
            </a>
          </div>
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary-container hover:text-primary transition-all cursor-pointer">
              <span className="material-symbols-outlined" data-icon="language">
                language
              </span>
            </div>
            <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary-container hover:text-primary transition-all cursor-pointer">
              <span className="material-symbols-outlined" data-icon="eco">
                eco
              </span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
