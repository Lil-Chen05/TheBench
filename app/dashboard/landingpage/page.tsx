import Image from 'next/image';

export default function DashboardLandingPage() {
  return (
    <main className="bg-black text-white">
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

function HeroSection() {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center text-center">
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-50" 
        style={{
          backgroundImage: "url('https://macleans.ca/_next/image/?url=https%3A%2F%2Fcms.macleans.ca%2Fwp-content%2Fuploads%2F2019%2F09%2FUNIVERSITY_RANKINGS_MCGILL_TEAM_NAME01.jpg&w=3840&q=80')"
        }}
      />
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
    <section className="bg-white text-black py-12">
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
    <section className="relative">
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
      <div className="bg-white py-16">
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
      text: "Pick up to eight players across at least two teams.",
    },
    {
      title: "Pick Higher or Lower",
      text: "Analyze player cards or trust your instincts.",
    },
    {
      title: "Select an entry fee",
      text: "Start at $1 and win up to 500x.",
    },
    {
      title: "Make your play",
      text: "Submit your entry and track live.",
    },
  ];

  return (
    <section className="bg-white text-black py-20">
      <h2 className="text-3xl font-black text-center mb-12 pixelated-text">
        How To Play Pick&apos;em
      </h2>

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 px-6 items-center">
        <div className="relative h-[600px]">
          <Image 
            src="/images/phone.png" 
            alt="App preview" 
            fill
            className="object-contain"
          />
        </div>

        <div className="space-y-6">
          {steps.map((step, i) => (
            <div key={i}>
              <p className="font-black uppercase pixelated-text">Step {i + 1}</p>
              <p className="font-semibold pixelated-text">{step.title}</p>
              <p className="text-sm opacity-80 pixelated-text">{step.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


function Availability() {
  return (
    <section className="bg-black py-20 text-center">
      <h2 className="text-3xl font-black mb-6 pixelated-text">
        Available in 9 Provinces
      </h2>
      <div className="relative h-[400px] max-w-md mx-auto">
        <Image
          src="/images/canada-map.png"
          alt="Canada availability"
          fill
          className="object-contain"
        />
      </div>
    </section>
  );
}


function LandingFooter() {
  return (
    <footer className="bg-black border-t border-white/10 py-10 text-sm">
      <div className="flex justify-center gap-6 pixelated-text">
        <a href="#">Picks</a>
        <a href="#">News</a>
        <a href="#">Track</a>
        <a href="#">Account</a>
      </div>
      <p className="text-center mt-6 opacity-60 pixelated-text">
        © The Bench
      </p>
    </footer>
  );
}