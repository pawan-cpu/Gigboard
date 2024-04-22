import { Fragment, useEffect, useMemo, useRef, useState} from 'react';
import { Dialog, Transition } from '@headlessui/react';
import classNames from 'classnames';
import { Web3ReactHooks } from '@web3-react/core';
import { XIcon } from '@heroicons/react/solid';
import {
  BookmarkIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  StarIcon,
} from "@heroicons/react/outline";

import { StarIcon as StarCheckedIcon } from "@heroicons/react/solid";

import { Contract } from "ethers";
//import { BigNumber } from "@ethersproject/bignumber";
import { formatEther, parseEther } from "@ethersproject/units";
import { difference, get, set } from "lodash";

import moment from "moment";

// import Dropzone from "../components/Dropzone";
import CONTRACT_ADDRESS from "../contract/service";
import contractABI from "../contract/TasksV1.json";
import axios from "../utils/service";
import { jobTypes } from "../data/options";

const colorMap = {
  yellow: "#FBBF16",
  "light-yellow": "#F9F8CB",
  green: "#00C6AD",
  red: "#F85A2A",
  white: "#FFF",
};

interface TaskPopupProps {
  open: boolean;
  hooks: Web3ReactHooks;
  taskID?: string;
  PK?: string;
  setOpen: (value: boolean) => void;
  setLoading: (newValue: boolean) => void;
  tastDetail: {
    userBookmarked: number;
    userView: number;
  };
}

const TaskPopup: React.FC<TaskPopupProps> = ({ 
  open,
  setOpen,
  hooks,
  taskID,
  PK,
  setLoading,
  tastDetail,
}) => {

  const { useProvider, useAccounts } = hooks;

  const provider = useProvider();
  const accounts = useAccounts();

  const [createTime, setCreateTime] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [countDown, setCountDown] = useState({ day: "0", hour: "0", min: "0" });
  const [duration, setDuration] = useState(0);

  const [creator, setCreator] = useState("");
  const [selectedApplicant, setSelectedApplicant] = useState("");
  const [attachment, setAttachment] = useState("");
  const [submission, setSubmission] = useState("");

  const [comment, setComment] = useState("");
  const [starHover, setStarHover] = useState(0);
  const [starSelect, setStarSelect] = useState(0);
  // const [attachment, setAttachment] = useState<Array<File>>([]);

  const cancelButtonRef = useRef(null);
  const [error, setError] = useState("");

  const totalStar = 5;

  const [polyCost, setPolyCost] = useState(0);
  const [status, setStatus] = useState(0);
  const [jobDesc, setJobDesc] = useState({});

  const [applicant, setApplicant] = useState<Array<string>>([]);
  const [allComment, setAllComment] = useState({});

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      if(provider){
        const connectContract = new Contract(
          CONTRACT_ADDRESS,
          contractABI.abi,
          provider?.getSigner()
        );
        const result = await connectContract.tasks(taskID);
        const tempCreator = get(result, "creator", "").toString();
        const tempStatus = get(result, "status", 0);
        const address = get(accounts, "[0]", "");
        setPolyCost(get(result, "salary", 0).toString());
        setCreateTime(get(result, "createdTime", 0).toString());
        setStartTime(get(result, "startTime", 0).toString());
        setDuration(get(result, "duration", 0).toString());
        setSubmission(get(result, "submission", "").toString());
        setCreator(tempCreator);
        setStatus(tempStatus);
        setSelectedApplicant(get(result, "provider", "").toString());

        const jobDesc = get(result, "jobDesc", "");
        const response = await axios(jobDesc).get("");
        setJobDesc(get(response, "data", {}));

        if(tempStatus === 0){
          let applicantResult = await connectContract.getApplicant(taskID);
          applicantResult = applicantResult.filter(
            (item: string) =>
              item !== "0x0000000000000000000000000000000000000000"
          );
          setApplicant(applicantResult);
        }
        if (tempStatus === 3){
          const rating = await connectContract.tasksRating(taskID);
          setAllComment({
            commentForCreator: get(rating, "commentForCreator", ""),
            commentForProvider: get(rating, "comentForProvider", ""),
            creatorRating: get(rating, "creatorRating" ,""),
            providerRating: get(rating, "providerRating", ""),
          });
        }
      }
      setLoading(false);
    }
    fetchData();
  }, [taskID, provider, setLoading, accounts]);

  useEffect(() => {
    const counter = () => {
      const currentTime = moment().unix();
      const endTime = moment.unix(startTime).add(duration, "days").unix();
      const differenceTime = endTime - currentTime;
      if(differenceTime > 0){
        const day = Math.floor(differenceTime / 86400);
        const hour = Math.floor((differenceTime - day * 86400) / 3600);
        const min = Math.floor(
          (differenceTime - day * 86400 - hour * 3600) / 60
        );
        setCountDown({
          day: day.toString(),
          hour: hour.toString(),
          min: min.toString(),
        });
      }
    };
    const timeLoop = setInterval(counter, 60000);
    counter();
    return () => clearInterval(timeLoop);
  }, [status, startTime, duration]);

  const jobFormat = useMemo(() => {
    return jobTypes.find(
      (item: any) => item.name === get(jobDesc, "jobType.value", "Frontend")
    );
  }, [jobDesc]);

  const stackList = useMemo(() => {
    return get(jobDesc, "stack", []).map((item: any) => item.value);
  }, [jobDesc]);

  const wallet = useMemo(() => {
    return get(accounts, "[0]", "");
  }, [accounts]);

  // Action
  const applyApplication = async () => {
    setError("");
    setLoading(true);
    const connectContract = new Contract(
      CONTRACT_ADDRESS,
      contractABI.abi,
      provider?.getSigner()
    );
    const tx = await connectContract.applyTask(taskID);
    if(!tx){
      setLoading(false);
      setError("Some issue on the contract");
      return;
    }
    provider!.once(tx.hash, async(tx) => {
      setLoading(false);
      setError("");
      const tempApplicant = Object.assign([], applicant);
      tempApplicant.push(get(accounts, "[0]", ""));
      setApplicant(tempApplicant);
      const response = await axios(
        "https://gig-board-demo.vercel.app/api"
      ).put("/tasks/apply", {
        PK,
        wallet: get(accounts, "[0]", ""),
        apply: true,
      });
    });
  };

  const withdrawApplication = async () => {
    if(confirm("Do you want to withdraw application?")){
      setError("");
      setLoading(true);
      const connectContract = new Contract(
        CONTRACT_ADDRESS,
        contractABI.abi,
        provider?.getSigner()
      );
      const tx = await connectContract.withdrawApplication(taskID);
      if(!tx){
        setLoading(false);
        setError("Some issue on the contract");
        return;
      }
      provider!.once(tx.hash, async (tx) => {
        setLoading(false);
        setError("");
        const tempApplicant = Object.assign([], applicant);
        const index = tempApplicant.findIndex(
          (item: any) => item === get(accounts, "[0]", "")
        );
        if(index > -1){
          tempApplicant.splice(index, 1);
        }
        setApplicant(tempApplicant);
        const response = await axios(
          "https://gig-board-demo.vercel.app/api"
        ).put("/tasks/apply", {
          PK,
          wallet: get(accounts, "[0]", ""),
          apply: false,
        });
      });
    }
  };

  const selectApplicant = async (applicantAddress: string) => {
    if(confirm("Do you want to select this applicat?")){
      setError("");
      setLoading(true);
      const connectContract = new Contract(
        CONTRACT_ADDRESS,
        contractABI.abi,
        provider?.getSigner()
      );
      const tx = await connectContract.startTask(taskID, applicantAddress);
      if(!tx){
        setLoading(false);
        setError("Some issue on the contract");
        return;
      }
      provider!.once(tx.hash, async(tx) => {
        setLoading(false);
        setError("");
        setStatus(2);
        setSelectedApplicant(applicantAddress)
        await axios(
          "https://gig-board-demo.vercel.app/api"
        ).put("/tasks/status", {
          PK,
          status: "started",
        });
        await axios(
          "https://gig-board-demo.vercel.app/api"
        ).put("/tasks/select/applicant", {
          PK,
          wallet: applicantAddress,
        });
      });
    }
  };

  const submitTask = async () => {
    if(confirm("Do you want to submit this task?")){
      setError("");
      setLoading(true);
      if(!attachment){
        setError("Please fill in the attachment link");
      }else{
        const connectContract = new Contract(
          CONTRACT_ADDRESS,
          contractABI.abi,
          provider?.getSigner()
        );
        const tx = await connectContract.submitResult(taskID, attachment);
        if(!tx){
          setLoading(false);
          setError("Some issue on the contract");
          return;
        }
        provider!.once(tx.hash, async(tx) => {
          setLoading(false);
          setError("");
          setSubmission(attachment);
        });
      }
    }
  };

  const approveTask = async () => {
    if(confirm(`Do you want to approve this submission? (Rating: ${starSelect})`)){
      setError("");
      setLoading(true);
      if(starSelect <= 0){
        setLoading(false);
        setError("Please rate the provider");
      }else{
        const connectContract = new Contract(
          CONTRACT_ADDRESS,
          contractABI.abi,
          provider?.getSigner()
        );
        const tx = await connectContract.setTaskCompleted(
          taskID,
          starSelect.toString(),
          comment
        );
        if(!tx){
          setLoading(false);
          setError("Some issue on the contract");
          return;
        }
        provider!.once(tx.hash, async (tx) => {
          await axios(
            "https://gig-board-demo.vercel.app/api"
          ).put("/tasks/status", {
            PK,
            status: "finished",
          });
          setStatus(3);
          setLoading(false);
          setError("");
        });
      }
    }
  };

  const rateCreator = async () => {
    if(confirm(`Do you want to rate the employer? (Rating: ${starSelect})`)){
      setError("");
      setLoading(true);
      if(starSelect <= 0){
        setLoading(false);
        setError("Please rate the employer");
      }else{
        const connectContract = new Contract(
          CONTRACT_ADDRESS,
          contractABI.abi,
          provider?.getSigner()
        );
        const tx = await connectContract.rateCreator(
          taskID,
          starSelect.toString(),
          comment
        );
        if(!tx){
          setLoading(false);
          setError("Some issue on the contract");
          return;
        }
        provider!.once(tx.hash, async (tx) => {
          const tempComment = Object.assign({}, allComment);
          set(tempComment, "commentForCreator", comment);
          set(tempComment, "creatorRating", starSelect);
          setAllComment(tempComment);
          setLoading(false);
          setError("");
        });
      }
    }
  };

  const cancelTask = async () => {
    if(confirm("Do you want to cancel this task?")){
      setError("");
      setLoading(true);
      const connectContract = new Contract(
        CONTRACT_ADDRESS,
        contractABI.abi,
        provider?.getSigner()
      );
      const tx = await connectContract.cancelTask(taskID);
      if(!tx){
        setLoading(false);
        setError("Some issue on the contract");
        return;
      }
      provider!.once(tx.hash, async (tx) => {
        await axios(
          "https://gig-board-demo.vercel.app/api"
        ).put("/tasks/status", {
          PK,
          status: "failed",
        });
        setLoading(false);
        setError("");
        setStatus(1);
        setOpen(false);
      });
    }
  };

  const disputeTask = async () => {
    if(confirm("Do you want to dispute this task?")){
      setError("");
      setLoading(true);
      const connectContract = new Contract(
        CONTRACT_ADDRESS,
        contractABI.abi,
        provider?.getSigner()
      );
      const tx = await connectContract.requestDispute(taskID);
      if(!tx){
        setLoading(false);
        setError("Some issue on the contract");
        return;
      }
      provider!.once(tx.hash, async (tx) => {
        await axios(
          "https://gig-board-demo.vercel.app/api"
        ).put("/tasks/status", {
          PK,
          status: "failed",
        });
        setLoading(false);
        setError("");
        setStatus(4);
      });
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
                        <CalendarIcon 
                          className="h-7 w-7 text-black inline-block align-middle"
                          aria-hidden="true"
                        />
                        <span className="font-bold text-lg inline-block align-middle ml-2 mt-1">
                          {moment.unix(createTime).format("DD/MM/YYYY")}
                        </span>
                        <ClockIcon 
                          className="h-7 w-7 text-black inline-block align-middle ml-2 mt-1"
                          aria-hidden="true"
                        />
                        <span className="font-bold text-lg inline-block align-middle ml-2 mt-1">
                          {duration} Day{duration > 1 && "s"}
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

                  <div
                    className="overflow-hidden grid-cols-5 lg:gap-4 border-black border-b-2"
                    style={{
                      backgroundColor: get(
                        colorMap,
                        `[${jobFormat?.color}]`,
                        "white"
                      ),
                    }}
                  >
                    <div className="pt-10 pb-8 px-4 sm:pt-16 sm:px-8 lg:py-10 lg:pr-0 xl:py-8 col-span-4 mt-auto">
                      <div className="lg:self-center">
                        <h2 className="text-xl font-extrabold text-black sm:text-3xl">
                          <span className="block">
                            {get(jobDesc, "postName", "")} {status === 4 && '(DISPUTED'}
                          </span>
                        </h2>
                        <p className="text-lg leading-6 text-black">
                          {get(jobDesc, "companyName", "")} (
                            {get(jobDesc, "companyType", "")}
                          )
                        </p>
                      </div>
                      <div className="-mt-6 aspect-w-5 md:aspect-w-2 md:aspect-h-1 col-span-1">
                        <img 
                          className="transform translate-y-6 w-full md:w-full -scale-x-1"
                          src="/assets/avatar/peep-17.svg"
                          alt="PeepSVG"
                        />
                      </div>
                    </div>
                    <div className="px-4 sm:px-8 py-8 overflow-y-auto max-h-96 scroll-style">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-center md:text-left">
                            <UserIcon 
                              className="h-6 w-6 text-black inline-block align-middle"
                              aria-hidden="true"
                            />
                            <span className="text-lg inline-block align-middle ml-2">
                              {get(tastDetail, "userView", 0)
                                .toString()
                                .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                              }
                            </span>
                            <BookmarkIcon 
                              className="h-6 w-6 text-black inline-block align-middle ml-8"
                              aria-hidden="true"
                            />
                            <span className="text-lg inline-block align-middle ml-2">
                              {get(tastDetail, "userBookmarked", 0)
                                .toString()
                                .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                              }
                            </span>
                            <img 
                              src="/assets/icon/polygon.svg"
                              className="h-6 w-6 text-black inline-block align-middle ml-8"
                              aria-hidden="true"
                              alt="polygon icon"
                            />
                            <span className="text-lg inline-block align-middle ml-2">
                              {formatEther(polyCost)}
                            </span>
                          </p>
                          {status !== 0 &&
                            (creator === wallet ||
                              selectedApplicant === wallet) && (
                                <p className="mt-2 text-center md:text-left">
                                  {get(jobDesc, "discord", "") && (
                                    <span className="mr-2 mt-2 text-white font-bold text-sm border-black border-t-2 border-x-2 border-b-4 text-center rounded-lg py-1 px-2 bg-discord">
                                      <img 
                                        src="/assets/icon/discord.svg"
                                        className="h-5 w-5 inline-block align-middle mr-1"
                                        aria-hidden="true"
                                        alt="discord icon"
                                      />{" "}
                                      {get(jobDesc, "discord", "")}
                                    </span>
                                  )}
                                  {get(jobDesc, "telegram", "") && (
                                    <span className="mr-2 mt-2 text-white font-bold text-sm border-black border-t-2 border-x-2 border-b-4 text-center rounded-lg py-1 px-2 bg-telegram">
                                      <img 
                                        src="/assets/icon/telegram.svg"
                                        className="h-5 w-5 inline-block align-middle mr-1"
                                        aria-hidden="true"
                                        alt="telegram icon"
                                      />{" "}
                                      {get(jobDesc, "telegram", "")}
                                    </span>
                                  )}
                                  {get(jobDesc,"whatsapp", "") && (
                                    <span className="mr-2 mt-2 text-white font-bold text-sm border-black border-t-2 border-x-2 border-b-4 text-center rounded-lg py-1 px-2 bg-whatsapp">
                                      <img 
                                        src="/assets/icon/whatsapp.svg"
                                        className="h-5 w-5 inline-block align-middle mr-1"
                                        aria-hidden="true"
                                        alt="whatsapp icon"
                                      />{" "}
                                      {get(jobDesc, "whatsapp", "")}
                                    </span>
                                  )}
                                  {get(jobDesc, "signal", "") && (
                                    <span className="mr-2 mt-2 text-white font-bold text-sm border-black border-t-2 border-x-2 border-b-4 text-center rounded-lg py-1 px-2 bg-signal">
                                      <img 
                                        src="/assets/icon/signal.svg"
                                        className="h-5 w-5 inline-block align-middle mr-1"
                                        aria-hidden="true"
                                        alt="signal icon"
                                      />{" "}
                                      {get(jobDesc, "signal", "")}
                                    </span>
                                  )}
                                </p>
                              )}
                            <div className="mt-4 text-center md:text-left">
                              {stackList.map((item: string) => (
                                <div
                                  key={item}
                                  className="inline-block px-3 text-base font-medium border-l-2 last:border-r-2 border-black"
                                >
                                  {item}
                                </div>
                              ))}
                            </div>
                        </div>
                        {status === 2 &&
                          (creator === wallet ||
                            selectedApplicant === wallet) && (
                              <div className="text-center md:text-right">
                                <div className="inline-block mr-2 border-black border-t-2 border-x-2 border-b-4 rounded-lg text-center w-20 h-24 font-bold py-4">
                                  <span className="text-4xl">
                                    {("00" + countDown.day).slice(-2)}
                                  </span>
                                  <br />
                                  <span className="text-sm">Day</span>
                                </div>
                                <div className="inline-block mr-2 border-black border-t-2 border-x-2 border-b-4 rounded-lg text-center w-20 h-24 font-bold py-4">
                                  <span className="text-4xl">
                                    {("00" + countDown.hour).slice(-2)}
                                  </span>
                                  <br />
                                  <span className="text-sm">Hours</span>
                                </div>
                                <div className="inline-block mr-2 border-black border-t-2 border-x-2 border-b-4 rounded-lg text-center w-20 h-24 font-bold py-4">
                                  <span className="text-4xl">
                                    {("00" + countDown.min).slice(-2)}
                                  </span>
                                  <br />
                                  <span className="text-sm">Mins</span>
                                </div>
                              </div>
                            )}
                      </div>
                      <div className="mt-4">
                        <p className="text-sm text-black text-center md:text-left">
                          {get(jobDesc, "jobDescription", "")}
                        </p>
                      </div>
                      {(creator === wallet && status !== 1) && (
                        <div className="mt-4">
                          <p className="font-bold text-base text-black text-center md:text-left">
                            Candidate
                          </p>
                          {status === 0 ? (
                            <div className="mt-4">
                              {applicant.map((item: string) => (
                                <div
                                  key={item}
                                  className="flex w-full items-center mb-2"
                                >
                                  <div className="flex-shrink-1">
                                    <div className="w-4 h-4 rounded-full border-2 bg-yellow inline-block align-middle" />
                                    <div className="ml-4 text-xs sm:text-base font-bold inline-block align-middle">
                                      {item}
                                    </div>
                                  </div>
                                  <div className="flex-shrink-0 ml-auto">
                                    <div className="w-36 grid-cols-2 gap-2">
                                      {/* <div className="col-span-1">
                                        <button className="border-black border-t-2 border-b-4 border-x-2 rounded-lg font-bold w-full py-1">
                                          View
                                        </button>
                                      </div> */}
                                      <div className="col-span-2">
                                        <button
                                          onClick={() => selectApplicant(item)}
                                          className="border-black border-t-2 border-b-4 border-x-2 rounded-lg font-bold w-full py-1"
                                        >
                                          Select
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="flex w-full items-center mb-2">
                              <div className="flex-shrink-1">
                                <div className="w-4 h-4 rounded-full border-2 bg-yellow inline-block align-middle" />
                                <div className="ml-4 text-xs sm:text-base font-bold inline-block align-middle">
                                  {selectedApplicant}
                                </div>
                              </div>
                              <div className="flex-shrink-0 ml-auto">
                                <div className="w-36 grid grid-cols-2 gap-2">
                                  <div className="col-span-2">
                                    {/* <button className="border-black border-t-2 border-b-4 border-x-2 rounded-lg font-bold w-full py-1">
                                      View
                                    </button> */}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      {status == 2 && selectedApplicant === wallet && (
                        <div className="mt-4">
                          <p className="font-bold text-base text-black text-center md:text-left">
                            Submission Attachment
                          </p>
                          <textarea
                            rows={1}
                            className="focus:outline-none text-sm border-black border-t-2 border-x-2 border-b-4 rounded-lg w-full px-4 py-2 mt-2 placeholder:text-black placeholder:font-medium"
                            placeholder="Submission Attachment"
                            value={submission || attachment}
                            onChange={(e) => setAttachment(e.target.value)}
                          >
                          </textarea>
                          {/* <div className="mt-2">
                            <Dropzone
                              onError={(newError) => setError(newError)}
                              value={attachment}
                              onChange={(newFile) => setAttachment(newFile)}
                            />
                          </div> */}
                        </div>
                      )}
                      {status > 2 && selectedApplicant === wallet && (
                        <div className="mt-4">
                          <p className="font-bold text-base text-black text-center md:text-left">
                            Submission Attachment
                          </p>
                          <textarea
                            rows={1}
                            className="focus:outline-none text-sm border-black border-t-2 border-x-2 border-b-4 rounded-lg w-full px-4 py-2 mt-2 placeholder:text-black placeholder:font-medium"
                            placeholder="Submission Attachment"
                            value={submission || "Not Yet Submitted"}
                          >
                          </textarea>
                        </div>
                      )}
                      {status >= 2 && creator === wallet && (
                        <div className="mt-4">
                          <p className="font-bold text-base text-black text-center md:text-left">
                            Submission Attachment
                          </p>
                          <textarea
                            rows={1}
                            className="focus:outline-none text-sm border-black border-t-2 border-x-2 border-b-4 rounded-lg w-full px-4 py-2 mt-2 placeholder:text-black placeholder:font-medium"
                            placeholder="Submission Attachment"
                            value={submission || "Not Yet Submitted"}
                          ></textarea>
                        </div>
                      )}
                      {((status === 2 && creator === wallet && submission !== '') || (status === 3 && selectedApplicant === wallet && get(allComment, "creatorRating", 0) === 0)) && (
                        <div className="mt-4">
                          <p className="font-bold text-base text-black text-center md:text-left">
                            Rating
                          </p>
                          <div className="mt-2 cursor-pointer text-center md:text-left">
                            {Array.from(Array(totalStar), (e, i) => {
                              return (
                                <div
                                  key={e}
                                  onMouseEnter={() => setStarHover(i+1)}
                                  onMouseLeave={() => setStarHover(0)}
                                  onClick={() => setStarSelect(i+1)}
                                  className={classNames(
                                    "w-7 h-7 inline-block mr-2 star-wrapper",
                                    i < starHover && "hover",
                                    i < starSelect && "hover"
                                  )}
                                >
                                  <StarIcon className="w-6 h-6 star" />
                                  <StarCheckedIcon className="w-6 h-6 star-checked" />
                                </div>
                              );
                            })}
                          </div>
                          <div className="mt-1">
                            <input 
                              type="text"
                              placeholder="Comment"
                              value={comment}
                              onChange={(e) => setComment(e.target.value)}
                              className="focus:outline-none text-sm border-black border-t-2 border-x-2 broder-b-4 rounded-lg w-full px-4 py-2 mt-2 placeholder:text-black placeholder:font-medium"
                            />
                          </div>
                        </div>
                      )}
                    {status === 3 && 
                      (creator === wallet || 
                        (selectedApplicant === wallet &&
                          get(allComment, "creatorRating", 0) > 0)) && (
                            <div className="mt-4">
                              <p className="font-bold text-base text-black text-center md:text-left">
                                Rating
                              </p>
                              {get(allComment, "creatorRating", 0) > 0 && (
                                <>
                                  <p className="font-bold text-base text-black text-center md:text-left mt-2">
                                    Employer Performance:
                                  </p>
                                  <div className="mt-2 cursor-pointer text-center md:text-left">
                                    {Array.from(Array(totalStar), (e, i) => {
                                      return(
                                        <div
                                          key={e}
                                          className={classNames(
                                            "w-7 h-7 inline-block mr-2 star-wrapper",
                                            i < get(allComment, "creatorRating", 0) && "hover"
                                          )}
                                        >
                                          <StarIcon className="w-6 h-6 star" />
                                          <StarCheckedIcon className="w-6 h-6 star-checked" />
                                        </div>
                                      );
                                    })}
                                  </div>
                                  <div className="mt-1">
                                    <p className="text-sm border-black border-t-2 border-x-2 border-b-4 rounded-lg w-full px-4 py-2 mt-2 text-black">
                                      {get(allComment, "commentForCreator", "")}
                                    </p>
                                  </div>
                                </>
                              )}
                              {get(allComment, "providerRating", 0) > 0 && (
                                <>
                                  <p className="font-bold text-base text-black text-center md:text-left mt-2">
                                    Freelancer Performance:
                                  </p>
                                  <div className="mt-2 cursor-pointer text-center md:text-left">
                                    {Array.from(Array(totalStar), (e, i) => {
                                      return (
                                        <div
                                          key={e}
                                          className={classNames(
                                            "w-7 h-7 inline-block mr-2 star-wrapper",
                                            i < get(allComment, "providerRating", 0) && "hover"
                                          )}
                                        >
                                          <StarIcon className="w-6 h-6 star" />
                                          <StarCheckedIcon className="w-6 h-6 star-checked" />
                                        </div>
                                      );
                                    })}
                                  </div>

                                  <div className="mt-1">
                                    <p className="text-sm border-black border-t-2 border-x-2 border-b-4 rounded-lg w-full px-4 py-2 mt-2 text-black">
                                      {get(allComment, "commentForProvider", "")}
                                    </p>
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                      {error && <p className="w-full mt-4">{error}</p>}
                      <div className="w-full mt-4">
                        {creator === wallet && status === 0 && (
                          <button
                            onClick={() => cancelTask()}
                            className="bg-red font-bold text-sm border-black border-t-2 border-x-2 border-b-4 text-center rounded-lg py-1 px-12"
                          >
                            Cancel Task
                          </button>
                        )}
                        {creator === wallet && status === 2 && (
                          <>
                            {submission !== '' ? (
                              <>
                                <button
                                  onClick={() => disputeTask()}
                                  className="bg-red font-bold text-sm border-black border-t-2 border-x-2 border-b-4 text-center rounded-lg py-1 px-12"
                                >
                                  Dispute Task
                                </button>
                                <button
                                  onClick={() => approveTask()}
                                  className="ml-4 bg-green font-bold text-sm border-black border-t-2 border-x-2 border-b-4 text-center rounded-lg py-1 px-12"
                                >
                                  Approve Task
                                </button>
                              </>
                            ) : (
                              <button className="cursor-not-allowed bg-gray font-bold text-sm border-black border-t-2 border-x-2 border-b-4 text-center rounded-lg py-1 px-12">
                                Cancel Task
                              </button>
                            )}
                          </>
                        )}
                        {selectedApplicant === wallet && status === 2 && (
                          <>
                            {submission ? (
                              <button className="cursor-not-allowed bg-gray font-bold text-sm border-black border-t-2 border-x-2 border-b-4 text-center rounded-lg py-1 px-12">
                                Submit Task
                              </button>
                            ) : (
                              <button
                                onClick={() => submitTask()}
                                className="bg-green font-bold text-sm border-black border-t-2 border-x-2 border-b-4 text-center rounded-lg py-1 px-12"
                              >
                                Submit Task
                              </button>
                            )}
                          </>
                        )}
                        {selectedApplicant === wallet && status === 3 && (
                          <>
                            {get(allComment, "creatorRating", 0) === 0 && (
                              <button
                                onClick={() => rateCreator()}
                                className="bg-green font-bold text-sm border-black border-t-2 border-x-2 border-b-4 text-center rounded-lg py-1 px-12"
                              > 
                                Rate the Employer
                              </button>
                            )}
                          </>
                        )}
                        {status === 4 && (
                          <button className="cursor-not-allowed bg-gray font-bold text-sm border-black border-t-2 border-x-2 border-b-4 text-center rounded-lg py-1 px-12">
                            Task Being Disputed
                          </button>
                        )}
                        {creator !== wallet && status === 0 && (
                          <>
                            {applicant.includes(wallet) ? (
                              <button
                                onClick={() => withdrawApplication()}
                                className="bg-red font-bold text-sm border-black border-t-2 border-x-2 border-b-4 text-center rounded-lg py-1 px-12"
                              >
                                Withdraw Application
                              </button>
                            ) : (
                              <button
                                onClick={() => applyApplication()}
                                className="font-bold text-sm border-black border-t-2 border-x-2 border-b-4 text-center rounded-lg py-1 px-12"
                              > 
                                Apply Now
                              </button>
                            )}
                          </>
                        )}
                      </div>
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

export default TaskPopup;