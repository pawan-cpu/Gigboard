import { Fragment, useRef, useEffect, useState, useMemo } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XIcon } from "@heroicons/react/solid";
import { Web3ReactHooks } from "@web3-react/core";
import { Contract } from "ethers";

import { DocumentTextIcon, UserGroupIcon } from "@heroicons/react/outline";

import { sampleData2 } from "../data/options";
import TaskCard from "./TaskCard";

import CONTRACT_ADDRESS from "../contract/service";
import contractABI from "../contract/TasksV1.json";
import axios from "../utils/service";
import { get } from "lodash";

interface NamecardPopupProps {
  open: boolean;
  hooks: Web3ReactHooks;
  setOpen: (value: boolean) => void;
  type: "namecard" | "resume";
  address: string;
  setLoading: (newValue: boolean) => void;
}

const NamecardPopup: React.FC<NamecardPopupProps> = ({
  type,
  open,
  setOpen,
  address,
  setLoading,
  hooks,
}) => {
  const { useProvider } = hooks;
  const [data, setData] = useState([]);
  const [friends, setFriends] = useState([]);

  const provider = useProvider();
  const cancelButtonRef = useRef(null);
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      let response = await axios(
        "https://gig-board-demo.vercel.app/api"
      ).get("/tasks");
      let tempData = get(response, "data.data", []);
      tempData = tempData.filter(
        (item: any) => get(item, "wallet", "") === address || get(item, "selectedApply", "") === address
      );
      setData(tempData);

      response = await axios(
        "https://gig-board-demo.vercel.app/api"
      ).get("/friends", { params: { wallet: address } });
      tempData = get(response, "data.data", []);
      setFriends(tempData);
      setLoading(false);
    }
    fetchData();
  }, [setLoading, provider, address]);

  const earning = useMemo(() => {
    let earn = 0;
    data.map((item: any) => {
      earn += parseFloat(item.salary)
    })
    return earn;
  }, [data]);

  return (
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
                          My {type === "namecard" ? "Namecard" : "Resume"}
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

                  <div className="p-6">
                    <div className="bg-green overflow-hidden grid grid-cols-5 lg:gap-4 border-black border-x-2 border-t-2 border-b-4 rounded-lg">
                      <div className="py-12 px-4 sm:pt-16 sm:px-12 lg:pr-0 col-span-3 my-auto">
                        <div className="lg:self-center">
                          <h2 className="text-4xl font-extrabold text-black">
                            <span className="block w-full break-words">
                              {address}
                            </span>
                          </h2>
                          <p className="text-xl leading-6 text-black mt-4 font-medium">
                            <DocumentTextIcon 
                              className="inline-block h-7 w-7 align-middle"
                              aria-hidden="true"
                            />{" "}
                            {data.length} Tasks
                          </p>
                          <p className="text-xl leading-6 text-black mt-4 font-medium">
                            <UserGroupIcon 
                              className="inline-block h-7 w-7 align-middle"
                              aria-hidden="true"
                            />{" "}
                            {friends.length} Friends
                          </p>
                          <p className="text-xl leading-6 text-black mt-4 font-medium">
                            <img 
                              src="/assets/icon/polygon.svg" 
                              alt="polygon icon"
                              className="inline-block h-7 w-7 align-middle"
                              aria-hidden="true" 
                            />{" "}
                            {earning} Matic Earned
                          </p>
                        </div>
                      </div>
                      <div className="-mt-6 aspect-w-5 md:aspect-w-2 md:aspect-h-1 col-span-2">
                        <img 
                          className="transform translate-y-6 w-full -scale-x-1"
                          src="/assets/avatar/peep-17.svg" 
                          alt="PeepSVG" 
                        />
                      </div>
                    </div>
                  </div>
                  {type === "resume" && data.length > 0 && (
                    <div className="mt-4 px-6 mb-12">
                      <p className="font-bold text-xl">History</p>
                      <div className="mt-4 mx-auto grid gap-5 sm:grid-cols-2 lg:max-w-none">
                        {data.map((item: any) => (
                          <TaskCard 
                            key={get(item, "PK", "")}
                            type={get(item, "status", "pending")}
                            createDate={get(item, "createTime", 0)}
                            jobName={get(item, "postName", "")}
                            jobType={get(item, "jobType.value", "")}
                            userBookmarked={get(item, "bookmark", []).length}
                            userView={get(item, "apply", []).length}
                            slack={get(item, "stacks", []).map((stack: any) =>
                              get(stack, "value", "")
                            )}
                            onClick={() => {}}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  {/* <div className="px-6 pb-4">
                    <div className="w-full mt-4">
                      <button className="mb-2 mr-2 bg-twitter text-white font-bold text-sm border-black border-t-2 border-x-2 border-b-4 text-center rounded-lg py-1 px-4">
                        <img
                          src="/assets/icon/twitter.svg"
                          className="h-4 w-4 inline-block align-middle mr-1"
                          aria-hidden="true"
                          alt="twitter icon"
                        />{" "}
                        Share Twitter
                      </button>
                      <button className="mb-2 mr-2 bg-facebook text-white font-bold text-sm border-black border-t-2 border-x-2 border-b-4 text-center rounded-lg py-1 px-4">
                        <img
                          src="/assets/icon/facebook.svg"
                          className="h-4 w-4 inline-block align-middle mr-1"
                          aria-hidden="true"
                          alt="facebook icon"
                        />{" "}
                        Share Facebook
                      </button>
                      <button className="mb-2 bg-share text-white font-bold text-sm border-black border-t-2 border-x-2 border-b-4 text-center rounded-lg py-1 px-4">
                        <img
                          src="/assets/icon/share.svg"
                          className="h-4 w-4 inline-block align-middle mr-1"
                          aria-hidden="true"
                          alt="Share icon"
                        />{" "}
                        Share
                      </button>
                    </div>
                  </div> */}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}

export default NamecardPopup;