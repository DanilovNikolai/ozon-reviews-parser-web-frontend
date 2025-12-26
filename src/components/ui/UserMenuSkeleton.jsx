export function UserMenuSkeleton() {
  return (
    <div className="hidden sm:flex items-center gap-3 bg-white shadow-md rounded-xl px-4 py-2">
      <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
      <div className="h-5 w-16 bg-gray-200 rounded animate-pulse" />
      <div className="h-5 w-12 bg-gray-200 rounded animate-pulse" />
    </div>
  );
}
