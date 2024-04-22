import React from 'react';

import classNames from 'classnames';

interface FriendTabBarProps {
  itemList: Array<string>;
  value: string;
  onChange: (newValue: string) => void;
}

const FriendTabBar: React.FC<FriendTabBarProps> = ({
  itemList,
  onChange,
  value,
}) => {
  return (
    <div className="flex flex-wrap">
      {itemList.map((item) => (
        <div
          key={item}
          onClick={() => onChange(item)}
          className={classNames(
            'mb-4 ease-in duration-100 select-none cursor-pointer inline-block px-2 sm:px-8 text-base sm:text-lg font-medium border-l-2 last:border-r-2 border-black',
            `hover:bg-black hover:text-white`,
            value === item ? 'bg-black text-white' : ''
          )}
        >
          {item}
        </div>
      ))}
    </div>
  );
};

export default FriendTabBar;