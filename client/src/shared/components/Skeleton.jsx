export default function Skeleton({
  className = '',
  variant = 'rounded', // 'rounded' | 'circular' | 'pill' | 'text' | 'rectangular'
  width,
  height,
  ...props
}) {
  const variantClass =
    variant === 'circular'
      ? 'rounded-full'
      : variant === 'pill'
      ? 'rounded-full'
      : variant === 'text'
      ? 'rounded-md h-4'
      : variant === 'rectangular'
      ? 'rounded-none'
      : 'rounded-2xl';

  return (
    <div
      className={['animate-pulse bg-gray-200/75', variantClass, className].filter(Boolean).join(' ')}
      style={{
        width: width !== undefined ? width : undefined,
        height: height !== undefined ? height : undefined,
      }}
      aria-hidden="true"
      {...props}
    />
  );
}

