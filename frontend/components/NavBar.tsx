import React, { Fragment, useEffect, useState } from 'react';

import type { Web3ReactHooks } from "@web3-react/core";

import { Disclosure, Menu, Transition } from "@headlessui/react";
import { SearchIcon } from '@heroicons/react/solid';
import { BellIcon, MenuIcon, XIcon } from '@heroicons/react/outline';

import { get } from "lodash";
import { BigNumber } from '@ethersproject/bignumber';
import { formatEther } from "@ethersproject/units";
import { disconnect } from 'process';

const useBalances = (
  provider?: ReturnType<Web3ReactHooks["useProvider"]>,
  accounts?: string[]
): BigNumber[] | undefined => {
  const [balances, setBalances] = useState<BigNumber[] | undefined>();

  useEffect(() => {
    if(provider && accounts?.length){
      let stale = false;

      void Promise.all(
        accounts.map((account) => provider.getBalance(account))
      ).then((balances) => {
        if(!stale){
          setBalances(balances);
        }
      });

      return () => {
        stale = true;
        setBalances(undefined);
      };
    }
  }, [provider, accounts]);

  return balances;
}

const NavBar = ({
  hooks,
  searchVal,
  onSearch,
  connect,
  disconnect,
  navigate,
} : {
  hooks: Web3ReactHooks;
  searchVal: string;
  onSearch: (type: string) => void;
  connect: () => void;
  disconnect: () => void;
  navigate: (type: string) => void;
}) => {

  const {
    useChainId,
    useAccounts,
    useError,
    useIsActivating,
    useIsActive,
    useProvider,
    useENSNames,
  } = hooks;
  const [user, setUser] = useState({ name: "", wallet: ""});
  const [login, setLogin] = useState(false);
  const accounts = useAccounts();
  const isActivating = useIsActivating();

  const isActive = useIsActive();

  const provider = useProvider();
  const ENSNames = useENSNames(provider);

  const balances = useBalances(provider, accounts);

  useEffect(() => {
    setUser({
      name: get(ENSNames, "[0]", get(accounts, "[0]", "Address Invalid")),
      wallet: `${formatEther(get(balances, "[0]", 0))} Matic`,
    });
  }, [ENSNames, accounts, balances]);

  useEffect(() => {
    setLogin(isActive);
  }, [isActive]);

  const userNavigation = [
    {
      name: "My Tasks",
      subText: "Tasks dashboard",
      noti: 1,
      onClick: () => navigate("tasks"),
    },
    {
      name: "Resume",
      subText: "View my resume",
      onClick: () => navigate("resume"),
    },
    {
      name: "Connect",
      subText: "View my Connection",
      noti: 1,
      onClick: () => navigate("friend"),
    },
    {name: "Disconnect", subText: "", onClick: () => disconnect() },
  ];

  return (
    <Disclosure as="header" className="bg-white border-b-2 border-black">
      {({ open }) => (
        <>
          <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:divide-y lg:divide-gray-200 lg:px-8">
            <div className="relative h-16 flex justify-between">
              <div className="relative z-10 px-2 flex lg:px-0">
                <div className="flex-shrink-0 flex items-center select-none">
                  <img 
                    className="block h-8 w-auto"
                    src="/assets/img/logo.svg"
                    alt="Workflow"
                  />
                  <span className="text-lg font-bold ml-2">BYOB</span>
                </div>
              </div>
              <div className="relative z-0 flex-1 px-2 flex items-center justify-center sm:absolute sm:inset-0">
                <div className="w-full sm:max-w-xs">
                  <label htmlFor="search" className="sr-only">
                    Search
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                      <SearchIcon 
                        className="h-5 w-5 text-black"
                        aria-hidden="true"
                      />
                    </div>
                    <input 
                      id="search"
                      name="search"
                      className="block w-full bg-white border-x-2 border-t-2 border-b-4 border-black rounded-full py-2 pl-10 pr-3 text-sm placeholder-black placeholder:font-bold sm:text-sm focus:outline-none"
                      placeholder="Search"
                      type="search"
                      value={searchVal}
                      onChange={(e) => onSearch(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="relative z-10 flex items-center lg-hidden">
                {/* Mobile menu buttom */}
                <Disclosure.Button className="ease-in duration-300 rounded-md p-2 inline-flex items-center justify-center text-black hover:bg-gray-100 hover:text-gray-500">
                  <span className="sr-only">Open menu</span>
                  {open ? (
                    <XIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <MenuIcon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
              <div className="hidden lg:relative lg:z-10 lg:ml-4 lg:flex lg:items-center">
                  {/* Profile dropdown */}
                  {login ? (
                    <>
                      <button
                        onClick={() => navigate("submitTask")}
                        className="px-4 text-center w-full bg-white border-x-2 border-t-2 border-b-4 border-black rounded-full py-2 text-sm font-bold focus:outline-none"
                      >
                        Submit Tasks
                      </button>
                      <Menu as="div" className="flex-shrink-0 relative ml-4">
                        <div>
                          <Menu.Button className="bg-white rounded-full flex">
                            <span className="sr-only">Open user menu</span>
                            <div className="text-center font-bold text-2xl h-10 w-10 rounded-full border-x-2 border-t-2 border-b-4 border-black">
                              {(user.name ? user.name : "A")
                                .charAt(0)
                                .toUpperCase()}
                            </div>
                          </Menu.Button>
                        </div>

                        <Transition
                          as={Fragment}
                          enter="transition ease-out duration-100"
                          enterFrom="transform opacity-0 scale-95"
                          enterTo="transform opacity-100 scale-100"
                          leave="transition ease-in duration-75"
                          leaveFrom="transform opacity-100 scale-100"
                          leaveTo="transform opacity-0 scale-95"
                        >
                          <Menu.Items className="cursor-pointer select-none origin-top-right absolute right-0 mt-2 w-60 rounded-md bg-white ring-1 ring-black ring-opacity-5 py-1 border-2 border-black">
                            {userNavigation.map((item) => (
                              <Menu.Item key={item.name}>
                                {({ active }) => (
                                  <div
                                    onClick={item.onClick}
                                    className="h-16 ease-in duration-300 flex item-center px-4 py-2 border-b-2 border-black last:border-b-0 hover:bg-gray-50 hover:text-gray-900"
                                  >
                                    <div className="flex-shrink-0">
                                      {item.name && (
                                        <div className="text-lg font-bold text-black">
                                          {item.name}
                                        </div>
                                      )}
                                      {item.subText && (
                                        <div className="text-sm font-medium text-gray-500">
                                          {item.subText}
                                        </div>
                                      )}
                                    </div>
                                    {/* {item.noti && (
                                      <button
                                        type="button"
                                        className="ease-in duration-300 ml-auto flex-shrink-0 bg-white rounded-full p-1 text-black hover:text-gray-500"
                                      >
                                        <span className="sr-only">
                                          View notifications
                                        </span>
                                        <div className="border-2 border-black bg-yellow text-black text-xs font-bold w-5 h-5 rounded-full">
                                          2
                                        </div>
                                      </button>
                                    )} */}
                                  </div>
                                )}
                              </Menu.Item>
                            ))}
                          </Menu.Items>
                        </Transition>
                      </Menu>
                    </>
                  ) : (
                    <button
                      onClick={isActivating ? undefined : () => connect()}
                      className="px-4 text-black text-center w-full bg-white border-x-2 border-t-2 border-b-4 border-black rounded-full py-2 text-sm font-bold focus:outline-none"
                    >
                      Connect Wallet
                    </button>
                  )}
              </div>
            </div>
          </div>

          <Disclosure.Panel as="nav" className="lg:hidden" aria-label="Global">
            <div className="border-t-2 border-black pt-4 pb-3">
              {login && (
                <div className="px-4 flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-center font-bold text-2xl h-10 w-10 ronded-full border-x-2 border-t-2 border-b-4 border-black">
                      {(user.name ? user.name : "A").charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div>
                    {user.name && (
                      <div className="text-base font-bold text-gray-800">
                        {user.name}
                      </div>
                    )}
                    <div className="text-sm font-medium text-gray-500">
                      {user.wallet}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="ease-in duration-300 ml-auto flex-shrink-0 bg-white rounded-full p-1 text-black hover:text-gray-500"
                  >
                    <span className="sr-only">View notifications</span>
                    <BellIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
              )}
              <div className={`px-2 space-y-1 ${login ? "mt-3" : "mt-0"}`}>
                {!login ? (
                  <Disclosure.Button
                    as="a"
                    className="cursor-pointer ease-in duration-300 block rounded-md py-2 px-3 text-base font-medium text-black hover:bg-gray-50 hover:text-gray-900"
                    onClick={isActivating ? undefined : () => connect()}
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="text-base font-bold text-black">
                          Connect Wallet
                        </div>
                        <div className="text-sm font-medium text-gray-500">
                          Connect your polygon wallet
                        </div>
                      </div>
                    </div>
                  </Disclosure.Button>
                ) : (
                  <Disclosure.Button
                    as="a"
                    className="cursor-pointer ease-in duration-300 block rounded-md py-2 px-3 text-base font-medium text-black hover:bg-gray-50 hover:text-gray-900"
                    onClick={() => navigate("submitTask")}
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="text-base font-bold text-black">
                          Submit Tasks
                        </div>
                        <div className="text-sm font-medium text-gray-500">
                          Task submission
                        </div>
                      </div>
                    </div>
                  </Disclosure.Button>
                )}
                {login && 
                  userNavigation.map((item) => (
                    <Disclosure.Button
                      key={item.name}
                      as="a"
                      onClick={item.onClick}
                      className="ease-in duration-300 block rounded-md py-2 px-3 text-base font-medium text-black hover:bg-gray-50 hover:text-gray-900"
                    >
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          {item.name && (
                            <div className="text-base font-bold text-black">
                              {item.name}
                            </div>
                          )}
                          {item.subText && (
                            <div className="text-sm font-medium text-gray-500">
                              {item.subText}
                            </div>
                          )}
                        </div>
                        {/* {item.noti && (
                          <button
                            type="button"
                            className="ease-in duration-300 ml-auto flex-shrink-0 bg-white rounded-full p-1 text-black hover:text-gray-500"
                          >
                            <span className="sr-only">View notifications</span>
                            <div className="border-2 border-black bg-yellow text-black text-xs font-bold w-5 h-5 rounded-full">
                              2
                            </div>
                          </button>
                        )} */}
                      </div>
                    </Disclosure.Button>
                ))}
              </div>
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
};

export default NavBar
