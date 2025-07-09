"use client";

export default function Home() {
  const scrollToHowTo = () => {
    const howToSection = document.getElementById("how-to-section");
    if (howToSection) {
      howToSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section 
        className="relative min-h-screen flex items-center justify-center px-4"
        style={{
          backgroundImage: `
            linear-gradient(rgba(21, 25, 42, 0.35), rgba(21, 25, 42, 0.35)),
            url('/images/chatbot.png')
          `,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Mobile background override */}
        <div 
          className="absolute inset-0 md:hidden"
          style={{
            backgroundImage: `
              linear-gradient(rgba(21, 25, 42, 0.40), rgba(21, 25, 42, 0.40)),
              url('/images/chatbot-mobile.png')
            `,
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat'
          }}
        />
        
        {/* Content Box */}
        <div className="relative z-10 max-w-3xl mx-auto p-8 md:p-12 bg-white/15 backdrop-blur-md rounded-xl md:rounded-xl shadow-xl">
          {/* Product Name - Separated */}
          <div className="text-center mb-8">
            <h1 className="text-5xl md:text-7xl font-black text-white drop-shadow-lg">
              AutoChat
            </h1>
          </div>
          
          {/* Main Content - Separated */}
          <div className="space-y-6 text-center">
            {/* Main Title */}
            <div>
              <h2 className="text-3xl md:text-5xl font-bold text-white drop-shadow-lg">
                Create a persona.
              </h2>
            </div>
            
            {/* Subtitle */}
            <div>
              <p className="text-xl md:text-3xl font-medium text-[#e6ebfc]">
                Automate your instagram chat
              </p>
            </div>
            
            {/* Additional subtitle */}
            <div>
              <p className="text-lg md:text-2xl font-normal text-[#e6ebfc]">
                Sell stuff
              </p>
            </div>
          </div>
          
          {/* Button - Separated */}
          <div className="text-center mt-10">
            <button
              onClick={scrollToHowTo}
              className="inline-block bg-[#f3aacb] text-[#334269] font-bold px-10 py-4 rounded-full text-lg md:text-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Try it now
            </button>
          </div>
        </div>
      </section>

      {/* How To Section */}
      <section 
        id="how-to-section"
        className="bg-white py-10 md:py-20 min-h-[60vh] flex items-center"
      >
        <div className="container mx-auto px-4">
          {/* Heading */}
          <h2 className="text-xl md:text-3xl font-black text-[#334269] text-center mb-6 md:mb-6">
            How it works
          </h2>
          
          {/* Steps */}
          <div className="max-w-4xl mx-auto">
            <div className="grid gap-4 md:gap-4">
              {[
                "1. Set your persona and preferences",
                "2. Connect your Instagram account", 
                "3. Watch as the AI handles your DMs for you"
              ].map((step, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-center text-base md:text-xl font-medium text-[#6c7fa7]"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-[#f3aacb] rounded-full flex items-center justify-center text-[#334269] font-bold text-sm md:text-base">
                      {index + 1}
                    </div>
                    <span className="text-center">{step}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
