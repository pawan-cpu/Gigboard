import React, { useEffect, useState } from 'react';
import moment from "moment";
import { get } from "lodash";
import { Web3ReactHooks } from '@web3-react/core';

const hour = moment().hour();

const Header = ({
  hooks,
  navigate,
  disconnect,
} : {
  hooks: Web3ReactHooks;
  navigate: (type: string) => void;
  disconnect: () => void;
}) => {

  const { useAccounts, useProvider, useENSNames } = hooks;
  const [name, setName] = useState("");
  const greeting = hour > 18 || hour < 6 ? "GN!☽" : "GM!☀";

  const provider = useProvider();
  const accounts = useAccounts();
  const ENSNames = useENSNames(provider);

  useEffect(() => {
    setName(get(ENSNames, "[0]", get(accounts, "[0]", "Address Invalid")));
  }, [ENSNames, accounts]);

  return (
    <div className="border-black bg-light-yellow border-2 rounded-lg shadow-xl overflow-hidden grid grid-cols-4 md:grid-cols-5 gap-4">
      <div className="pt-10 pb-12 px-6 sm:pt-16 lg:px-16 lg:py-16 lg:pr-0 xl:py-20 xl:pl-20 select-none col-span-3">
        <div className="lg:self-center">
          <h2 className="text-black">
            <span className="block font-extrabold text-8xl">{greeting}</span>
            <span className="block font-medium text-4xl truncate">{name}</span>
          </h2>
          <button
            onClick={() => navigate("resume")}
            className="mt-8 bg-white border-x-2 border-t-2 border-b-4 border-black rounded-md px-3 inline-flex items-center text-base font-bold text-black hover:bg-gray-200"
          >
            View Resume
          </button>
          <button
            onClick={() => disconnect()}
            className="ml-2 mt-8 bg-white border-x-2 border-t-2 border-b-4 border-black rounded-md px-3 inline-flex items-center text-base font-bold text-black hover:bg-gray-200"
          >
            Disconnect
          </button>
        </div>
      </div>
      <div className="-mt-6 aspect-w-5 aspect-h-3 md:aspect-w-2 md:aspect-h-1 col-span-1 md:col-span-2">
        <img 
          className="transform translate-y-32 md:translate-y-6 rounded-md object-cover object-left-top lg:translate-y-10 w-full md:w-5/6 -scale-x-1"
          src={`/assets/avatar/peep-${hour + 1}.svg`}
          alt="Avatar"
        />
      </div>
    </div>
  );
};

export default Header;