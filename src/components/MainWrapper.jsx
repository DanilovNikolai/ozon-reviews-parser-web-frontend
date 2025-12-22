import clsx from 'clsx';

const MainWrapper = ({ children, className }) => {
  return (
    <main className={clsx('bg-white shadow-md rounded-xl p-4 sm:p-8', className)}>{children}</main>
  );
};

export default MainWrapper;
