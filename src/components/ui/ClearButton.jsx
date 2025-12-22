import clsx from 'clsx';

export default function ClearButton({
  type = 'button',
  onClick,
  disabled = false,
  className,
  children,
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        `h-10 px-4 sm:w-auto w-full text-sm rounded-lg border border-gray-300 bg-gray-50 transition
        hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400
        disabled:cursor-not-allowed cursor-pointer whitespace-nowrap`,
        className
      )}
    >
      {children}
    </button>
  );
}
