import { SearchIcon } from './components/icons';
import HeaderNav from './components/HeaderNav';

export default function Header() {
  return (
    <header className="h-14 lg:h-[60px] border-b bg-gray-100/40 dark:bg-gray-800 dark:border-gray-950">
      <div className="flex justify-between items-center h-full px-6">
        <div className="relative">
          <div className="absolute left-2 h-full flex items-center">
            <SearchIcon className="h-5 w-5 dark:text-gray-500" />
          </div>
          <input
            type="text"
            placeholder="Search..."
            className="dark:bg-gray-950 pl-9 py-2 pr-3 rounded-md w-64 bg-gray-100 dark:text-gray-100 dark:placeholder-gray-300 dark:border-gray-950 border dark:border-gray-950 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
        <div className="flex items-center">
          <HeaderNav />
          <img
            alt="Avatar"
            className="rounded-full"
            height="32"
            src="https://generated.vusercontent.net/placeholder.svg"
            style={{
              aspectRatio: '32/32',
              objectFit: 'cover',
            }}
            width="32"
          />
        </div>
      </div>
    </header>
  );
}
