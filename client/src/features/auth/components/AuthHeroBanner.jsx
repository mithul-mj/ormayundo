export default function AuthHeroBanner() {
  return (
    <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-brand to-rose-600 flex-col justify-center p-8 sm:p-12 lg:p-16 text-white relative overflow-hidden">
      {/* Decorative ambient background rings / glow */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-black/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-lg">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
          Remember everything you read.
        </h1>
        <p className="text-base sm:text-lg font-normal text-white/90 leading-relaxed mb-8">
          Ormayundo captures key knowledge from the web and turns it into high-retention active recall
          flashcards with mathematical spaced repetition.
        </p>
        <div className="flex gap-3 items-center">
          <div className="flex -space-x-3">
            <div className="w-9 h-9 rounded-full border-2 border-white bg-white/20 backdrop-blur-xs flex items-center justify-center text-xs font-bold text-white">
              A
            </div>
            <div className="w-9 h-9 rounded-full border-2 border-white bg-white/30 backdrop-blur-xs flex items-center justify-center text-xs font-bold text-white">
              K
            </div>
            <div className="w-9 h-9 rounded-full border-2 border-white bg-white/40 backdrop-blur-xs flex items-center justify-center text-xs font-bold text-white">
              S
            </div>
          </div>
          <p className="text-xs sm:text-sm font-medium text-white/90">Join thousands of active learners.</p>
        </div>
      </div>
    </div>
  );
}
