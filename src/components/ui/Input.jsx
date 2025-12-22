import clsx from 'clsx';

// Стили
const baseInputClass =
  'h-10 w-full box-border rounded-lg border text-sm bg-gray-50 transition focus:outline-none focus:ring-1';
const normalInput = 'border-gray-300 focus:ring-blue-600/40';
const textPadding = 'px-3';
const errorInput = 'border-red-400 focus:ring-red-400/40';
const monoInput = 'font-mono';
const fileInput =
  'flex items-center cursor-pointer p-0 file:h-full file:mr-3 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-100 file:text-blue-700 file:rounded-l-lg hover:file:bg-blue-200';

export default function Input({ type = 'text', error = false, mono = false, className, ...props }) {
  return (
    <input
      type={type}
      className={clsx(
        baseInputClass,
        type !== 'file' && textPadding,
        error ? errorInput : normalInput,
        mono && monoInput,
        type === 'file' && fileInput,
        className
      )}
      {...props}
    />
  );
}
