export default function AuthHeroBanner() {
  return (
    <div className={
      [
        'md:flex-1 bg-gradient-to-br from-brand-light to-brand flex flex-col',
        'justify-center p-12 text-white relative overflow-hidden'
      ].join(' ')
    }>
      {/* Decorative Pattern overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative z-10 max-w-lg">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
          Remember everything you read.
        </h1>
        <p className="text-lg md:text-xl font-medium text-white/90 leading-relaxed mb-8">
          Ormayundo captures key knowledge from the web and turns it into high-retention active recall
          flashcards.
        </p>
        <div className="flex gap-4 items-center">
          <div className="flex -space-x-4">
            <div className={
      [
        'w-10 h-10 rounded-full border-2 border-brand bg-white flex items-center',
        'justify-center text-xs font-bold text-gray-800'
      ].join(' ')
    }>
              A
            </div>
            <div className={
      [
        'w-10 h-10 rounded-full border-2 border-brand bg-gray-100 flex items-center',
        'justify-center text-xs font-bold text-gray-800'
      ].join(' ')
    }>
              K
            </div>
            <div className={
      [
        'w-10 h-10 rounded-full border-2 border-brand bg-gray-200 flex items-center',
        'justify-center text-xs font-bold text-gray-800'
      ].join(' ')
    }>
              S
            </div>
          </div>
          <p className="text-sm font-semibold">Join the knowledge revolution.</p>
        </div>
      </div>
    </div>
  );
}
