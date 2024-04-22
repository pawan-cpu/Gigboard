import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XIcon, CheckIcon } from '@heroicons/react/solid';
import { Web3ReactHooks } from '@web3-react/core';

import { get, set } from "lodash";

import FriendTabBar from "./FriendTabBar";
import axios from '../utils/service';
import { isAddress } from 'ethers/lib/utils';

import NamePopup from "./NamePopup";

interface FriendPopupProps {
  open: boolean;
  hooks: Web3ReactHooks;
  setOpen: (value: boolean) => void;
  setLoading: (newValue: boolean) => void;
}

const FriendPopup: React.FC<FriendPopupProps> = ({
  open,
  setOpen,
  hooks,
  setLoading,
}) => {

  const { useAccounts } = hooks;
  const accounts = useAccounts();

  const [filter, setFilter] = useState("All");
  const [data, setData] = useState([]);
  const [friendWallet, setFriendWallet] = useState("");
  const [friendViewAddress, setFriendViewAddress] = useState("");
  const [namecard, setNamecard] = useState(false);
  const [error, setError] = useState("");
  const cancelButtonRef = useRef(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const response = await axios(
        "https://gig-board-demo.vercel.app/api"
      ).get("/friend", { params: { wallet: get(accounts, "[0]", "")}});
      const tempData = get(response, "data.data", []);
      setData(tempData);
      setLoading(false);
    }
    fetchData();
  }, [setLoading, accounts]);

  const filterData = useMemo(() => {
    let tempData = Object.assign([], data);
    if(filter !== "All"){
      if(filter === "Friends"){
        tempData = tempData.filter((item: any) => item.status === "accepted");
      }else{
        tempData = tempData.filter((item: any) => item.status === "pending");
      }
    }else{
      tempData = tempData.filter((item: any) => item.status !== "rejected");
    }
    return tempData;
  }, [data, filter]);

  const wallet = useMemo(() => {
    return get(accounts, "[0]", "");
  }, [accounts]);

  const updateState = async (PK: string, status: string) => {
    const tempData = Object.assign([], data);
    const index = tempData.findIndex((item: any) => item.PK === PK);
    console.log(index);
    if(index > -1){
      set(tempData, `[${index}].status`, status);
    }
    setData(tempData);
    await axios(
      "https://gig-board-demo.vercel.app/api"
    ).put("/friends", {
      PK,
      status,
    });
  };

  const connectWallet = async () => {
    setError("");
    if(!isAddress(friendWallet)){
      setError("Your address format invaild");
    }else{
      setLoading(true);
      const result = await axios(
        "https://gig-board-demo.vercel.app/api"
      ).post("/friends", {
        friendWallet,
        wallet: get(accounts, "[0]", ""),
      });
      if(result.data.status === "success"){
        const tempData: any = Object.assign([], data);
        tempData.push({
          PK: "brandNew",
          status: "pending",
          friendWallet,
          wallet: get(accounts, "[0]", ""),
        });
        setData(tempData);
        setFriendWallet("");
      }
      setError("");
      setLoading(false);
    }
  };

  const openNamecard = (friendAddress: string) => {
    setFriendViewAddress(friendAddress);
    setNamecard(true);
  };

  return (
    <>
      <NamePopup 
        address={friendViewAddress}
        type="resume"
        open={namecard}
        setLoading={setLoading}
        hooks={hooks}
        setOpen={setNamecard}
      />
      <Transition.Root show={open} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          initialFocus={cancelButtonRef}
          onClose={setOpen}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-white bg-opacity-50 transition-opacity" />
          </Transition.Child>

          <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-full p-4 text-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="border-black border-x-2 border-t-2 border-b-4 relative bg-white rounded-lg text-left overflow-hidden transform transition-all sm:my-8 sm:max-w-3xl sm:w-full">
                  <div>
                    <div className="flex items-center justify-center h-8 w-full border-black border-b-2 px-4">
                      <div className="flex-shrink-1">
                        <p>
                          <span className="font-bold text-lg inline-block align-middle ml-2 mt-1">
                            Add Friends
                          </span>
                        </p>
                      </div>
                      <div className="ml-auto flex-shrink-0 pl-12">
                        <button
                          onClick={() => setOpen(false)}
                          className="cursor-pointer bg-red relative w-5 h-5 border-black border-2 rounded-full text-center"
                        >
                          <XIcon 
                            className="position-center h-4 w-4"
                            aria-hidden="true"
                          />
                        </button>
                      </div>
                    </div>

                    <div className="bg-light-yellow overflow-hidden grid grid-cols-5 lg:gap-4 border-black border-b-2">
                      <div className="pt-10 pb-8 px-4 sm:pt-16 sm:px-16 lg:py-10 lg:pr-10 xl:py-8 col-span-4 my-auto">
                        <div className="lg:self-center">
                          <h2 className="font-extrabold text-black text-6xl">
                            <span className="block truncate">Add Friends</span>
                          </h2>
                        </div>
                      </div>
                      <div className="-mt-6 aspect-w-5 md:aspect-w-2 ms:aspect-h-1 col-span-1">
                        <img
                          className="transform translate-y-6 w-full md:w-full -scale-x-1" 
                          src="/assets/avatar/peep-17.svg" 
                          alt="PeepSVG" 
                        />
                      </div>
                    </div>
                    <div className="px-4 pt-5 pb-8 sm:px-16 overflow-y-auto max-h-96 scroll-style">
                      <div className="flex border-black border-t-2 border-x-2 border-b-4 rounded-lg mt-2 pl-4 pr-2 py-2">
                        <input 
                          type="text"
                          placeholder="Polygon Address"
                          value={friendWallet}
                          onChange={(e) => setFriendWallet(e.target.value)}
                          className="focus:outline-none text-sm w-full placeholder:text-black placeholder:font-medium"
                        />
                        <button
                          onClick={() => connectWallet()}
                          className="font-medium py-1 px-2 bg-yellow rounded-lg border-black border-x-2 border-t-2 border-b-4"
                        >
                          Connect
                        </button>
                      </div>
                      {error && (
                        <div className="mt-2">
                          <p className="text-red">{error}</p>
                        </div>
                      )}
                      <div className="mt-4">
                        <FriendTabBar 
                          itemList={["All", "Friends", "Pending"]}
                          value={filter}
                          onChange={(newValue) => setFilter(newValue)}
                        />
                      </div>
                      {filterData.map((item: any) => (
                        <div key={item.PK} className="mt-4">
                          <div className="flex w-full items-center">
                            <div className="flex-shrink-1">
                              <div className="w-4 h-4 rounded-full border-2 bg-yellow inline-block align-middle" />
                              <div className="ml-4 text-xs sm:text-base font-bold inline-block align-middle">
                                {item.wallet === wallet
                                  ? item.friendWallet
                                  : item.wallet
                                }
                              </div>
                            </div>
                            <div className="flex-shrink-0 ml-auto">
                              <div className="w-20 grid grid-cols-2 gap-4">
                                {item.status === "pending" &&
                                  item.friendWallet === wallet && (
                                    <>
                                      <div className="col-span-1">
                                        <button
                                          onClick={() =>
                                            updateState(item.PK, "accepted")
                                          }
                                          className="text-center bg-success border-black border-t-2 border-x-2 rounded-lg font-bold w-full py-1"
                                        >
                                          <CheckIcon 
                                            className="mx-auto h-4 w-4"
                                            aria-hidden="true"
                                          />
                                        </button>
                                      </div>
                                    </>
                                  )
                                }
                                {item.status === "accepted" && (
                                  <div className="col-span-2">
                                    <button
                                      onClick={() =>
                                        openNamecard(
                                          item.wallet === wallet
                                            ? item.friendWallet
                                            : item.wallet
                                        )
                                      }
                                      className="border-black border-t-2 border-b-4 border-x-2 rounded-lg font-bold w-full py-1"
                                    >
                                      View
                                    </button>
                                  </div>
                                )}
                                {item.status === "pending" &&
                                  item.wallet === wallet && (
                                    <div className="col-span-2">
                                      <button
                                        onClick={() => 
                                          openNamecard(
                                              item.wallet === wallet
                                              ? item.friendWallet
                                              : item.wallet
                                          )
                                        }
                                        className="border-black border-t-2 border-b-4 border-x-2 rounded-lg font-bold w-full py-1"
                                      >
                                        View
                                      </button>
                                    </div>
                                  )
                                }
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  )
}

export default FriendPopup