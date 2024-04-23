import { Fragment, useEffect, useRef, useState} from 'react';
import type { Web3ReactHooks } from "@web3-react/core";
import { Dialog, Transition } from '@headlessui/react';
import { XIcon } from '@heroicons/react/solid';
import Select, { MultiValue, SingleValue } from "react-select";
import { BigNumber } from "@ethersproject/bignumber";
import { formatEther, parseEther } from '@ethersproject/units';
import { Contract } from "ethers";

import { get, set } from "lodash";

import { jobTypeOptions, stackTypeOptions } from '../data/options';
import CONTRACT_ADDRESS from "../contract/service";
import contractABI from "../contract/TasksV1.json";
import axios from '../utils/service';
import moment from "moment";

interface AddTaskPopupProps {
  open: boolean;
  hooks: Web3ReactHooks;
  setOpen: (value: boolean) => void;
  setLoading: (newValue: boolean) => void;
}

const useBalances = (
  provider?: ReturnType<Web3ReactHooks["useProvider"]>,
  accounts?: string[]
): BigNumber[] | undefined => {
  const [balances, setBalances] = useState<BigNumber[] | undefined>();

  useEffect(() => {
    if(provider && accounts?.length){
      let stale = false;

      void Promise.all(
        accounts.map((accounts) => provider.getBalance(accounts))
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
};

const AddTaskPopup: React.FC<AddTaskPopupProps> = ({
  open,
  setOpen,
  hooks,
  setLoading,
}) => {
  const { useProvider, useAccounts, useENSNames } = hooks;

  const provider = useProvider();
  const ENSNames = useENSNames(provider);
  const accounts = useAccounts();

  const balances = useBalances(provider, accounts);

  const [user, setUser] = useState({ name: "", wallet: "" });
  // const [salary, setSalary] = useState("0.01");
  const [salary, setSalary] = useState("");
  const [description, setDescription] = useState({});
  // const [description, setDescription] = useState({
  //   companyName: "Company Name",
  //   companyType: "company Type",
  //   postName: "Post Name",
  //   jobDuration: "20",
  //   jobType: { value: "Frontend", label: "Frontend" },
  //   stacks: [{ label: "React", value: "React" }],
  //   jobDescription: "Sample Description",
  //   discord: "@samsek",
  // });
  const [error, setError] = useState("");

  const cancelButtonRef = useRef(null);
  const customStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      border: 0,
      outlineWidth: state.isFocused ? 0 : 0,
      boxShadow: "none",
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: "black",
    }),
  };

  useEffect(() => {
    setUser({
      name: get(ENSNames, "[0]", get(accounts, "[0]", "Address Invalid")),
      wallet: `${formatEther(get(balances, "[0]", 0))} Matic`,
    });
  }, [ENSNames, accounts, balances]);

  const setDescriptionValue = (
    keyName: string,
    valName:
      | string
      | MultiValue<{ label: string; value: string }>
      | SingleValue<{ value: string; label: string } | {}>
      | null
  ) => {
    const tempDescription = Object.assign({}, description);
    set(tempDescription, keyName, valName);
    setDescription(tempDescription);
  };

  const submitTask = async () => {
    setLoading(true);
    setError("");
    try{
      let showError = false;
      const keyList = [
        "companyName",
        "companyType",
        "postName",
        "jobDuration",
        "jobType",
        "stacks",
        "jobDescription",
      ];
      keyList.forEach((item) => {
        const value = get(description, item, "");
        if(!value){
          setError("Please fill in all the fields");
          showError = true;
          return;
        }
      });
      const discord = get(description, "discord", "");
      const whatsapp = get(description, "whatsapp", "");
      const telegram = get(description, "telegram", "");
      const signal = get(description, "signal", "");
      if(!discord && !whatsapp && !telegram && !signal){
        setError("Please fill in at lease one contract method");
        showError = true;
      }
      if(!salary){
        setError("Please fill in salary");
        showError = true;
      }else if (parseFloat(salary) > parseFloat(get(user, "wallet", "0"))) {
        setError("You don't have sufficient fund");
        showError = true;
      }
      if (!showError) {
        //IPFS api route
        const ipfs = await axios(
          "https://gig-board-demo.vercel.app/api"
        ).post(
          "/ipfs",
          {
            ...description,
            salary,
            discord,
            whatsapp,
            telegram,
            signal,
          }
        );
        {/* const ipfsResponse = await fetch("/api/ipfs", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...description,
            salary,
            discord,
            whatsapp,
            telegram,
            signal,
          }),
        }); */}
        //contract
        const referenceCode = moment().unix();
        const connectContract = new Contract(
          CONTRACT_ADDRESS,
          contractABI.abi,
          provider?.getSigner()
        );
        const tx = await connectContract.createTask(
          get(description, "jobDuration", ""),
          get(ipfs, "data.data", ""),
          referenceCode.toString(),
          { value: parseEther(salary).toString() }
        );
        if(!tx){
          setLoading(false);
          setError("Some issue on the contract");
          return;
        }
        provider!.once(tx.hash, async(tx) => {
          //cache server
          await axios(
            "https://gig-board-demo.vercel.app/api"
          ).post("/tasks", {
            ...description,
            wallet: get(accounts, "[0]", "Address Invalid"),
            salary,
            discord,
            whatsapp,
            telegram,
            signal,
            tx: get(tx, "transactionHash", ""),
            ipfs: get(ipfs, "data.data", ""),
          });
          {/* await fetch("/api/tasks", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ...description,
              wallet: get(accounts, "[0]", "Address Invalid"),
              salary,
              discord,
              whatsapp,
              telegram,
              signal,
              tx: get(tx, "transcationHash", ""),
              ipfs: get(ipfsResponse, "data.data", ""),
            }),
          }); */}
          connectContract.on(
            "0xadca11b273fe1ba007c6a34b6348e66e3650c3c46cd1bbd731f1b8b4d583945c",
            async(id, task, address) => {
              if(address === get(accounts, '[0]', '')){
                await axios(
                  "https://gig-board-demo.vercel.app/api"
                ).put("/tasks/taskID", {
                  PK: get(tx, "transactionHash", ""),
                  taskID: id.toString(),
                });
                {/* await fetch("/api/tasks/taskID", {
                  body: JSON.stringify({
                    PK: get(tx, "trasactionHash", ""),
                    taskID: id.toString(),
                  })
                }) */}
              }
              setDescription({});
              setSalary("");
              setError("");
              setLoading(false);
              setOpen(false);
            }
          );
        });
      }else{
        setLoading(false);
      }
    } catch (err) {
      console.log(err);
      setError("Server Issue (100)");
      setLoading(false);
    }
  };

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
                          Submit Tasks
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

                  <div className="bg-blue overflow-hidden grid grid-cols-5 lg:gap-4 border-black border-b-2">
                    <div className="pt-10 pb-8 px-4 sm:pt-16 sm:px-16 lg:py-10 lg:pr-0 xl:py-8 col-span-4 my-auto">
                      <div className="lg:self-center">
                        <h2 className="font-extrabold text-white">
                          <span className="block truncate text-6xl">
                            Submit Task
                          </span>
                          <br />
                          <span className="block truncate text-xl -mt-5">
                            {user.name}
                          </span>
                        </h2>
                      </div>
                    </div>
                    <div className="-mt-6 aspect-w-5 md:aspect-w-2 md:aspect-h-1 col-span-1">
                      <img className="transform translate-y-6 w-full md:w-full -scale-x-1" src={"/assets/avatar/peep-7.svg"} alt="PeepSVG" />
                    </div>
                  </div>
                  <div className="px-4 pt-5 pb-8 sm:px-10">
                    <div className="mt-4">
                      <p className="font-bold text-base text-black text-left">
                        Company Name *
                      </p>
                      <input 
                        type="text" 
                        className="focus:outline-none text-sm border-black border-t-2 border-x-2 border-b-4 rounded-lg w-full px-4 py-2 mt-2 placeholder:text-gray-500 placeholder:font-medium"
                        placeholder="Company Name"
                        onChange={(e) => 
                          setDescriptionValue("companyName", e.target.value)
                        }
                        value={get(description, "companyName", "")}
                      />
                    </div>

                    <div className="mt-4">
                      <p className="font-bold text-base text-black text-left">
                        Comapny Type *
                      </p>
                      <input 
                        type="text"
                        className="focus:outline-none text-sm border-black border-t-2 border-x-2 border-b-4 rounded-lg w-full px-4 py-2 mt-2 placeholder:text-gray-500 placeholder:font-medium"
                        placeholder="Comapny Type"
                        onChange={(e) => 
                          setDescriptionValue("companyType", e.target.value)
                        }
                        value={get(description, "comapnyType", "")}
                      />
                    </div>

                    <div className="mt-4">
                      <p className="font-bold text-base text-black text-left">
                        Post Name *
                      </p>
                      <input 
                        type="text"
                        className="focus:outline-none text-sm border-black border-t-2 border-x-2 border-b-4 rounded-lg w-full px-4 py-2 mt-2 placeholder:text-gray-500 placeholder:font-medium"
                        placeholder="Post Name"
                        onChange={(e) => 
                          setDescriptionValue("postName", e.target.value)
                        }
                        value={get(description, "postName", "")}
                      />
                    </div>

                    <div className="mt-4">  
                      <p className="font-bold text-base text-black text-left">
                        Job Duration *
                      </p>
                      <input 
                        type="number"
                        className="focus:outline-none text-sm border-black border-t-2 border-x-2 border-b-4 rounded-lg w-full px-4 py-2 mt-2 placeholder:text-gray-500 placeholder:font-medium"
                        placeholder="Job Duration"
                        min={1}
                        onChange={(e) =>
                          setDescriptionValue("jobDuration", e.target.value)
                        }
                        value={get(description, "jobDuration", "")}
                      />
                    </div>

                    <div className="mt-4">
                      <p className="font-bold text-base text-black tetx-left">
                        Job Type *
                      </p>
                      <Select 
                        className="focus:outline-none text-sm border-black border-t-2 border-x-2 border-b-4 rounded-lg w-full px-2 mt-2 placeholder:text-gray-500 placeholder:font-medium"
                        options={jobTypeOptions}
                        styles={customStyles}
                        placeholder="Job Type"
                        onChange={(newValue) =>
                          setDescriptionValue("jobType", newValue)
                        }
                        value={get(description, "jobType", {})}
                      />
                    </div>

                    <div className="mt-4">
                      <p className="font-bold text-base text-black text-left">
                        Required Software / Stacks *
                      </p>
                      <Select 
                        className="focus:outline-none text-sm border-black border-t-2 border-x-2 border-b-4 rounded-lg w-full px-2 mt-2 placeholder:text-gray-500 placeholder:font-medium"
                        /*options={stackTypeOptions}*/
                        styles={customStyles}
                        placeholder="Required Software / Stacks"
                        isMulti
                        onChange={(newValue) =>
                          setDescriptionValue("stacks", newValue)
                        }
                        value={get(description, "stacks", [])}
                      />
                    </div>

                    <div className="mt-4">
                      <p className="font-bold text-base text-black text-left">
                        Salary (Matic) *
                      </p>
                      <input 
                        type="number" 
                        className="focus:outline-none text-sm border-black border-t-2 border-x-2 border-b-4 rounded-lg w-full px-4 py-2 mt-2 placeholder:text-gray-500 placeholder:font-medium"
                        placeholder="Salary"
                        min={1}
                        onChange={(e) => setSalary(e.target.value)}
                        value={salary}
                      />
                    </div>

                    <div className="mt-4">
                      <p className="font-bold text-base text-black text-left">
                        Job Description *
                      </p>
                      <textarea 
                        rows={4}
                        className="focus:outline-none text-sm border-black border-t-2 border-x-2 border-b-4 rounded-lg w-full px-4 py-2 mt-2 placeholder:text-gray-500 placeholder:font-medium"
                        placeholder="Job Description" 
                        onChange={(e) => 
                          setDescriptionValue("jobDescription", e.target.value)
                        }
                        value={get(description, "jobDescription", "")}
                      ></textarea>
                    </div>

                    <div className="mt-4">
                      <p className="font-bold text-base text-black text-left">
                        Contract Method (Please fill in at least on contact method)
                      </p>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div>
                          <p className="font-medium text-base text-black text-left">
                            Discord Account
                          </p>
                          <input 
                            type="text" 
                            className="focus:outline-none text-sm border-black border-t-2 border-x-2 border-b-4 rounded-lg w-full px-4 py-2 mt-2 placeholder:text-gray-500 placeholder:font-medium"
                            placeholder="Discord Account"
                            onChange={(e) =>
                              setDescriptionValue("discord", e.target.value)
                            }
                            value={get(description, "discord", "")}
                          />
                        </div>

                        <div>
                          <p className="font-medium text-base text-black text-left">
                            Telegram Account
                          </p>
                          <input 
                            type="text" 
                            className="focus:outline-none text-sm border-black border-t-2 border-x-2 border-b-4 rounded-lg w-full px-4 py-2 mt-2 placeholder:text-gray-500 placeholder:font-medium"
                            placeholder="Telegram Account"
                          />
                        </div>

                        <div>
                          <p className="font-medium text-base text-black text-left">
                            Whatsapp Account
                          </p>
                          <input 
                            type="text" 
                            className="focus:outline-none text-sm border-black border-t-2 border-x-2 border-b-4 w-full px-4 py-2 mt-2 placeholder:text-gray-500 placeholder:font-medium"
                            placeholder="Whatsapp Account"
                            onChange={(e) =>
                              setDescriptionValue("whatsapp", e.target.value)
                            }
                            value={get(description, "whatsapp", "")}
                          />
                        </div>

                        <div>
                          <p className="font-medium text-base text-black text-left">
                            Signal Account
                          </p>
                          <input 
                            type="text" 
                            className="focus:outline-none text-sm border-black border-t-2 border-x-2 border-b-4 rounded-lg w-full px-4 py-2 mt-2 placeholder:text-gray-500 placeholder:font-medium"
                            placeholder="Signal Account"
                            onChange={(e) =>
                              setDescriptionValue("signal", e.target.value)
                            }
                            value={get(description, "signal", "")}
                          />
                        </div>
                      </div>
                    </div>

                    {error && <p className="mt-2 text-red">{error}</p>}

                    <div className="mt-16">
                      <button
                        onClick={() => submitTask()}
                        className="bg-green font-bold text-sm border-black border-t-2 border-x-2 border-b-4 text-center rounded-lg py-1 px-12"
                      >
                        Submit
                      </button>
                      <button
                        onClick={() => setOpen(false)}
                        className="font-bold text-sm border-black border-t-2 border-x-2 border-b-4 text-center rounded-lg py-1 px-12 ml-4"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default AddTaskPopup;