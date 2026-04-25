const SkeletonCard = () => (
  <div className="card overflow-hidden">
    <div className="aspect-[2/3] skeleton" />
    <div className="p-3 space-y-2">
      <div className="h-4 skeleton rounded w-3/4" />
      <div className="h-3 skeleton rounded w-1/3" />
      <div className="h-3 skeleton rounded w-full" />
      <div className="h-3 skeleton rounded w-5/6" />
      <div className="h-8 skeleton rounded-xl mt-3" />
    </div>
  </div>
);

export default SkeletonCard;
