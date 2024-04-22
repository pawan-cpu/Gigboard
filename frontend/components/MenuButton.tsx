import React from 'react';

import { ClipboardListIcon, NewspaperIcon, UserIcon } from '@heroicons/react/solid';

interface MenuButtonProps {
  name: string;
  subText: string;
  noti?: number;
  icon: 'task' | 'resume' | 'connect';
  onClick: () => void;
}

const MenuButton: React.FC<MenuButtonProps> = ({ name, subText, noti, icon, onClick }) => {
  return (
    <div onClick={onClick} className="relative ease-in duration-100 h-full px-6 py-2 border-black border-x-2 border-t-2 border-b-4 rounded-lg overflow-hidden select-none cursor-pointer hover:bg-gray-50 hover:text-gray-900 flex items-center">
      <div className="flex-shrink-0">
        {name && <div className="text-2xl md:text-3xl font-bold text-black">{name}</div>}
        {subText && (
          <div className="text-xs md:text-sm font-medium text-gray-500">{subText}</div>
        )}
      </div>
      <div className="ml-auto flex-shrink-0 text-black">
          {icon === 'task' && <ClipboardListIcon className="h-10 w-10 md:h-14 md:w-14" aria-hidden="true" />}
          {icon === 'resume' && <NewspaperIcon className="h-10 w-10 md:h-14 md:w-14" aria-hidden="true" />}
          {icon === 'connect' && <UserIcon className="h-10 w-10 md:h-14 md:w-14" aria-hidden="true" />}
      </div>
      {/* {noti && (
        <button
          type="button"
          className="absolute -top-1 -right-1 ease-in duration-100 ml-auto flex-shrink-0 text-black hover:text-gray-500"
        >
          <span className="sr-only">View notifications</span>
          <div className="border-2 border-black bg-yellow text-black text-sm font-bold w-6 h-6 rounded-full">
            2
          </div>
        </button>
      )} */}
    </div>
  );
};

export default MenuButton;