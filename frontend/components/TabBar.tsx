import React from 'react';

import classNames from 'classnames';

interface TabBarProps {
  nameList: Array<{
    name: string;
    color: string;
  }>;
  value: string;
  onChange: (newValue: string) => void;
}

const TabBar: React.FC<TabBarProps> = ({ nameList, onChange, value}) => {
  return (
    <div className="flex flex-wrap">
      {nameList.map((item) => (
        <div
          key={item.name}
          onClick={() => onChange(item.name)}
          className={classNames(
            `md-4 ease-in duration-100 select-none cursor-pointer inline-block px-2 sm:px-8 text-base sm:text-xl font-medium border-l-2 last:border-r-2 border-black`,
            `hover:bg-black hover:text-white`,
            value === item.name ? 'bg-black text-white' : '',
          )}
        >
          {item.name}
        </div>
      ))}
    </div>
  )
}

export default TabBar;