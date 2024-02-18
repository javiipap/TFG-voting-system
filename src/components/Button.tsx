export default function Button({ children }: { children: React.ReactNode }) {
  return (
    <button className="inline-flex items-center justify-center rounded-md text-sm font-medium disabled:pointer-events-none disabled:opacity-50 border border-input px-4 py-2 ml-auto h-8 w-[100px] md:w-auto bg-white hover:bg-gray-100 transition dark:bg-gray-800 dark:border-gray-800 dark:text-white dark:hover:bg-gray-900">
      {children}
    </button>
  );
}
