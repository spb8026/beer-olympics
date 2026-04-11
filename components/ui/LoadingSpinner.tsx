export default function LoadingSpinner({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-yellow-400">
      <div className="w-10 h-10 border-4 border-white/10 border-t-yellow-400 rounded-full animate-spin" />
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}
