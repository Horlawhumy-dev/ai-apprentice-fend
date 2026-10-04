export function Backdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-canvas" />
      <div className="absolute inset-0 grid-lines opacity-60" />
      <div className="absolute -top-48 -left-40 size-[42rem] animate-drift rounded-full bg-brand/20 blur-[130px]" />
      <div className="absolute top-1/4 -right-44 size-[38rem] animate-float rounded-full bg-info/18 blur-[140px]" />
      <div className="absolute -bottom-56 left-1/4 size-[40rem] animate-drift rounded-full bg-brand/15 blur-[150px]" />
      <div className="noise absolute inset-0 opacity-[0.025] mix-blend-overlay" />
    </div>
  );
}

export default Backdrop;
