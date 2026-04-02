export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-3xl mx-auto">
        {/* Logo/Title */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Healthcare AI Search
          </h1>
          <p className="text-muted-foreground text-lg">
            Intelligent medical information at your fingertips
          </p>
        </div>

        {/* Search Input */}
        <div className="animate-slide-up">
          <div className="relative">
            <input
              type="text"
              placeholder="Ask anything about healthcare..."
              className="w-full px-6 py-4 text-lg border-2 border-border rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-background shadow-lg hover:shadow-xl"
              autoFocus
            />
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-6 py-2 rounded-full font-medium hover:opacity-90 transition-opacity"
            >
              Search
            </button>
          </div>

          {/* Example Queries */}
          <div className="mt-8 space-y-3">
            <p className="text-sm text-muted-foreground">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {[
                "What are the symptoms of type 2 diabetes?",
                "How does mRNA vaccine technology work?",
                "Latest treatments for migraine headaches",
              ].map((query, i) => (
                <button
                  key={i}
                  className="px-4 py-2 text-sm bg-secondary text-secondary-foreground rounded-full hover:bg-secondary/80 transition-colors"
                >
                  {query}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-12 text-center text-xs text-muted-foreground">
          <p>
            This tool provides information for educational purposes only.
            Always consult healthcare professionals for medical advice.
          </p>
        </div>
      </div>
    </main>
  );
}
