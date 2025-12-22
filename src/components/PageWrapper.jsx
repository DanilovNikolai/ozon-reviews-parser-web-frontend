import clsx from 'clsx';

const PageWrapper = ({ children, className }) => {
  return (
    <div className={clsx('min-h-screen flex flex-col items-center', className)}>
      <div className="w-full max-w-3xl px-4 sm:px-0">{children}</div>
    </div>
  );
};

export default PageWrapper;
