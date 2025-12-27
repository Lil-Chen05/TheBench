import Image from 'next/image';

export default function DashboardLandingPage() {
  return (
    <main className="bg-black text-white">
      <LandingNav />
      <HeroSection />
      <StatsSection />
      <SportsStrip />
      <WinningSection />
      <HowToPlay />
      <Availability />
      <LandingFooter />
    </main>
  );
}

function LandingNav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <span className="text-2xl font-black pixelated-text text-white">THE BENCH</span>
        </div>

        {/* App Store Buttons */}
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-black/60 backdrop-blur-sm border border-white/30 pixelated-text text-xs hover:bg-black/80 transition-colors rounded">
            Download on App Store
          </button>
          <button className="px-4 py-2 bg-black/60 backdrop-blur-sm border border-white/30 pixelated-text text-xs hover:bg-black/80 transition-colors rounded">
            Get it on Google Play
          </button>
        </div>
      </div>
    </nav>
  );
}

function HeroSection() {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center text-center">
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-50" 
        style={{
          backgroundImage: "url('https://macleans.ca/_next/image/?url=https%3A%2F%2Fcms.macleans.ca%2Fwp-content%2Fuploads%2F2019%2F09%2FUNIVERSITY_RANKINGS_MCGILL_TEAM_NAME01.jpg&w=3840&q=80')"
        }}
      />
      {/* Fade to next section - subtle */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-b from-transparent to-white z-10"></div>
      
      <div className="relative z-10 max-w-5xl px-6">
        {/* Top banner with blurred background */}
        <div className="inline-block mb-6 px-8 py-3 rounded-full backdrop-blur-md bg-black/40 border border-white/30">
          <p className="text-sm md:text-base font-black uppercase tracking-widest text-white pixelated-text">
            No One Rides The Bench Here
          </p>
        </div>

        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-wide pixelated-text">
          U Sports First Pick&apos;em Platform
        </h1>

        <p className="text-3xl md:text-5xl font-black uppercase tracking-wide mt-2 pixelated-text">
          Make Picks. Win Money
        </p>

        <p className="mt-6 text-lg md:text-xl opacity-50 pixelated-text tracking-tight">
          Join the hundreds of fans who made their picks on The Bench this season
        </p>
      </div>
    </section>
  );
}

function StatsSection() {
  const stats = [
    { value: "56", label: "Leagues" },
    { value: "21,000+", label: "Student Athletes" },
    { value: "300+", label: "Games" },
    { value: "550+", label: "Teams" },
  ];

  return (
    <section className="bg-white text-black py-12 relative">
      <h2 className="text-4xl font-black text-center mb-8 pixelated-text uppercase">
        U Sports
      </h2>
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {stats.map((s) => (
          <div key={s.label}>
            <p className="text-3xl font-black pixelated-text">{s.value}</p>
            <p className="uppercase text-sm font-semibold pixelated-text">{s.label}</p>
          </div>
        ))}
      </div>
      {/* Fade to next section - subtle */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-b from-transparent to-black z-10"></div>
    </section>
  );
}

function SportsStrip() {
  const logos = [
    { name: "usports", url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQdMueRkHyXbG-iRDsrhxO-T0nfGMqfzZDzyg&s" },
    { name: "oua", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/OUA_logo.svg/2560px-OUA_logo.svg.png" },
    { name: "rseq", url: "https://upload.wikimedia.org/wikipedia/fr/a/a6/RSEQ_Logo.png" },
    { name: "canadawest", url: "https://upload.wikimedia.org/wikipedia/en/d/dd/Canada_West_Logo.png" },
    { name: "atlantic", url: "https://upload.wikimedia.org/wikipedia/en/thumb/0/0b/Atlantic_University_Sport_Logo.svg/1200px-Atlantic_University_Sport_Logo.svg.png" },
  ];

  return (
    <section id="sports" className="relative">
      {/* Background Image Section with Text */}
      <div className="relative min-h-[400px] overflow-hidden">
        <Image
          src="/calgary_champions.jpg"
          alt="Calgary Dinos Basketball Champions"
          fill
          className="object-cover"
          priority
        />
        
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/60"></div>
        
        {/* Fade to next section - subtle */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-b from-transparent to-white z-10"></div>
        
        {/* Header Section */}
        <div className="relative z-10 max-w-4xl mx-auto text-center px-6 py-16">
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-wide pixelated-text mb-6 text-white">
            The Sports You Love All In One App
          </h2>
          <p className="text-base md:text-lg opacity-90 pixelated-text leading-relaxed max-w-3xl mx-auto text-white">
            No matter how you follow the game, THE BENCH has you covered — with real money action across the widest range of daily fantasy sports anywhere.
          </p>
        </div>
      </div>

      {/* White Background Section with Logos */}
      <div className="bg-white py-16 relative">
        <div className="flex flex-wrap justify-center items-center gap-20 px-6">
          {logos.map((logo) => (
            <div key={logo.name} className="relative h-20 w-32">
              <Image
                src={logo.url}
                alt={`${logo.name} logo`}
                fill
                className="object-contain"
                unoptimized
              />
            </div>
          ))}
        </div>
        {/* Fade to next section - subtle */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-b from-transparent to-black z-10"></div>
      </div>
    </section>
  );
}

function WinningSection() {
  return (
    <section className="relative min-h-[400px] overflow-hidden">
      <Image
        src="/basketball_court.jpg"
        alt="Basketball Court"
        fill
        className="object-cover"
        priority
      />
      
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/60"></div>
      
      {/* Fade to next section - subtle */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-b from-transparent to-white z-20"></div>
      
      {/* Content Section */}
      <div className="relative z-10 max-w-4xl mx-auto text-center px-6 py-16">
        <h2 className="text-2xl md:text-4xl font-black uppercase tracking-wide pixelated-text mb-6 text-white">
          Winning doesn&apos;t have to be complicated
        </h2>
        <p className="text-sm md:text-base opacity-90 pixelated-text leading-relaxed max-w-3xl mx-auto text-white">
          THE BENCH is the simplest way to play daily fantasy sports. With simple gameplay, big payouts and quick & secure withdrawals, it&apos;s time to cash in on your sports knowledge. It&apos;s Good To Be Right.
        </p>
      </div>
    </section>
  );
}

function HowToPlay() {
  const steps = [
    {
      title: "Choose your stats",
      text: "Start your Pick'em entry by choosing up to eight players' stats — just make sure there's at least two different teams in your entry. If you get your picks right, you'll win up to 500x your money.",
      image: "/step1.jpg"
    },
    {
      title: "Pick Higher or Lower",
      text: "Research players' past performances from their player cards, or go with your instincts. It's your call. ",
      image: "/step2.jpg"
    },
    {
      title: "Select an entry fee",
      text: "The minimum entry fee on Underdog is $1. Our entry page lets you see how much you could win on a Standard or Flexed version of your Pick'em entry.",
      image: "/step3.jpg"
    },
    {
      title: "Make your play",
      text: "Your entry is ready to go. Submit your entry by pressing the yellow button at the bottom of the entry screen, then watch along in real time to see whether your entry hits.",
      image: "/step4.jpg"
    },
  ];

  return (
    <section id="how-to-play" className="bg-white text-black py-20 relative">
      <h2 className="text-3xl font-black text-center mb-12 pixelated-text">
        How To Play Pick&apos;em
      </h2>

      {/* Phone Demo Image Container */}
      <div className="max-w-4xl mx-auto mb-16 px-6">
        <div className="relative h-[600px]">
          <Image 
            src="/phone_demo.jpg" 
            alt="App preview" 
            fill
            className="object-contain"
          />
        </div>
      </div>

      {/* Steps Container - Centered Divider with Text on Right */}
      <div className="max-w-7xl mx-auto px-6 space-y-16">
        {steps.map((step, i) => (
          <div key={i} className="flex flex-col md:flex-row items-center justify-center gap-0">
            {/* Step Image - Left of Center with Right Margin */}
            <div className="relative h-96 w-96 md:h-[450px] md:w-[450px] flex-shrink-0 md:mr-20">
              <Image
                src={step.image}
                alt={`Step ${i + 1}`}
                fill
                className="object-cover rounded-lg"
              />
            </div>

            {/* Vertical Divider Line - Centered */}
            <div className="hidden md:block w-px bg-gray-300 h-[450px] mx-0"></div>

            {/* Step Text - Right of Center, Pushed Further Right */}
            <div className="flex-1 max-w-xs pt-4 md:ml-16">
              <p className="font-black uppercase pixelated-text text-xs mb-1">Step {i + 1}</p>
              <p className="font-semibold pixelated-text text-sm mb-2 leading-tight">{step.title}</p>
              <p className="text-xs opacity-80 pixelated-text leading-relaxed">{step.text}</p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Fade to next section - very subtle */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-b from-white/0 to-white z-10"></div>
    </section>
  );
}


function Availability() {
  return (
    <section id="availability" className="bg-white py-20 text-center relative">
      <h2 className="text-3xl font-black mb-6 pixelated-text text-black">
        Available in 9 Provinces
      </h2>
      <div className="relative h-[400px] max-w-md mx-auto">
        <Image
          src="/canada_map.jpg"
          alt="Canada availability"
          fill
          className="object-contain"
        />
      </div>
      {/* Fade to next section (footer) - subtle */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-b from-transparent to-black z-10"></div>
    </section>
  );
}


function LandingFooter() {
  return (
    <footer className="bg-black border-t border-white/10 py-10 text-sm">
      <div className="flex justify-center gap-6 pixelated-text">
        <a href="#"> Company</a>
        <a href="#">News</a>
        <a href="#">Resource</a>
        <a href="#">Follow Us </a>
      </div>
      <p className="text-center mt-6 opacity-60 pixelated-text">
        © The Bench
      </p>
    </footer>
  );
}