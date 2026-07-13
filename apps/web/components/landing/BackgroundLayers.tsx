export function BackgroundLayers() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-bg-0">
      <div className="absolute -left-[8%] -top-[12%] h-[620px] w-[620px] animate-drift-1 rounded-full bg-[radial-gradient(circle,#3d6bff_0%,transparent_70%)] opacity-[0.14] blur-[100px]" />
      <div className="absolute -right-[14%] top-[35%] h-[520px] w-[520px] animate-drift-2 rounded-full bg-[radial-gradient(circle,#3d6bff_0%,transparent_70%)] opacity-[0.14] blur-[100px]" />
      <div className="absolute -bottom-[16%] left-[28%] h-[460px] w-[460px] animate-drift-3 rounded-full bg-[radial-gradient(circle,#3d6bff_0%,transparent_70%)] opacity-[0.14] blur-[100px]" />
      <div className="bg-noise absolute inset-0 opacity-[0.035] mix-blend-overlay" />
    </div>
  );
}
