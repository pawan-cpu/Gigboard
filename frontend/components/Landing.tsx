import { useMemo, useEffect, useState } from "react";
import type { NextPage } from "next";

import { initializeConnector } from "@web3-react/core";
import { MetaMask } from "@web3-react/metamask";
import { ethers } from 'ethers';

import Head from "next/head";
import { get, set } from "lodash";
import { PlusSmIcon } from "@heroicons/react/solid";
import { BookmarkIcon } from "@heroicons/react/outline";

import NavBar from "../components/NavBar";
import Header from "../components/Header";
import ConnectHeader from "../components/ConnectHeader";
import MenuButton from "../components/MenuButton";
import TabBar from "../components/TabBar";
import TaskCard from "../components/TaskCard";
import TaskPopup from "../components/TaskPopup";
import AddTaskPopup from "../components/AddTaskPopup";
import NamecardPopup from "../components/NamePopup";
import FriendPopup from "../components/FriendPopup";
import LoadingBar from "../components/LoadingBar";

import { jobTypes } from "../data/options";
import axios from "../utils/service";

const [metaMask, hooks] = initializeConnector<MetaMask>(
  (actions) => new MetaMask({actions})
);

const { useIsActive, useAccounts } = hooks;

const JobPage: NextPage = () => {
  const [search, setSearch] = useState("");
  const [login, setLogin] = useState(false);
  const [loading, setLoading] = useState(true);

  const [filter, setFilter] = useState("All");
  const [bookmark, setBookmark] = useState(false);
  const [all, setAll] = useState(true);
  const [taskOpen, setTaskOpen] = useState(false);
  const [namecardOpen, setNamecardOpen] = useState(false);
  const [nameCardType, setNamecardType] = useState<"resume" | "namecard">(
    "resume"
  );
  const [friendOpen, setFriendOpen] = useState(false);
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [data, setData] = useState([]);

  const [taskID, setTaskID] = useState("1");
  const [PK, setPK] = useState("");
  const [tastDetail, setTaskDetail] = useState({
    userBookmarked: 0,
    userView: 0,
  });

  const isActive = useIsActive();
  const accounts = useAccounts();

  const [errorMessage, setErrorMessage] = useState(null);
  const [defaultAccount, setDefaultAccount] = useState(null);
  const [userBalance, setUserBalance] = useState(null);

  // api route
  const fetchData = async () => {
    const response = await axios(
      "https://gig-board-demo.vercel.app/api"
    ).get("/tasks");
    const tempData = get(response, "data.data", []);
    setData(tempData);
    setLoading(false);
  };
  {/* const fetchData = async () => {
    try{
      const response = await fetch("/api/tasks");
      const tempData = await response.json();
      setData(tempData);
      setLoading(false);
    } catch (error) {
      console.error(error);
    }
  } */}

  useEffect(() => {
    fetchData();
  }, []);

  const connectWallet = (connect: boolean) => {
    if (connect) {
      metaMask.activate();
    } else {
      metaMask.activate();
    }

  };
  const navigate = (type: string) => {
    switch (type) {
      case "tasks":
        setAll(false);
        break;
      case "resume":
        setNamecardType("resume");
        setNamecardOpen(true);
        break;
      case "friend":
        setFriendOpen(true);
        break;
      case "submitTask":
        setAddTaskOpen(true);
        break;
    }
  };

  useEffect(() => {
    setLogin(isActive);
  }, [isActive]);

  useEffect(() => {
    if (!addTaskOpen || !taskOpen) {
      fetchData();
    }
  }, [addTaskOpen, taskOpen]);

  const updateBookmark = async (PK: string, bookmark: boolean) => {
    const tempData = Object.assign([], data);
    const index = tempData.findIndex((item: any) => item.PK === PK);
    let tempBookmark = get(tempData, `[${index}].bookmark`, []);
    if (bookmark) {
      //tempBookmark.push(get(accounts, "[0]", ""));
    } else {
      tempBookmark = tempBookmark.filter(
        (item: string) => item !== get(accounts, "[0]", "")
      );
    }
    set(tempData, `[${index}].bookmark`, tempBookmark);
    setData(tempData);
    const response = await axios(
      "https://gig-board-demo.vercel.app/api"
    ).put("/tasks/bookmark", {
      PK,
      wallet: get(accounts, "[0]", ""),
      bookmark,
    });
  };

  const filterData = useMemo(() => {
    const wallet = get(accounts, "[0]", "");
    let tempData = Object.assign([], data);
    if (all) {
      tempData = tempData.filter(
        (item: any) =>
          get(item, "wallet", "") !== wallet &&
          get(item, "status", "") === "pending"
      );
      if (bookmark) {
        tempData = tempData.filter((item: any) =>
          get(item, "bookmark", []).includes(wallet)
        );
      }
      if (filter !== "All") {
        tempData = tempData.filter(
          (item: any) => get(item, "jobType.value", "") === filter
        );
      }
    } else {
      tempData = tempData.filter(
        (item: any) =>
          get(item, "wallet", "") === wallet ||
          get(item, "selectedApply", "") === wallet ||
          (get(item, "apply", []).includes(wallet) &&
            get(item, "selectedApply", "") !== wallet)
      );
    }
    if (search) {
      tempData = tempData.filter((item: any) =>
        get(item, "postName", "").toLowerCase().includes(search.toLowerCase())
      );
    }
    return tempData;
  }, [data, bookmark, all, accounts, filter, search]);

  const taskDetailOpen = (item: any) => {
    setTaskID(get(item, "taskID", "").toString());
    setPK(get(item, "PK", ""));
    setTaskDetail({
      userBookmarked: get(item, "bookmark", []).length,
      userView: get(item, "apply", []).length,
    });
    setTaskOpen(true);
  };

  return (
    <div>
      <Head>
        <title>CryptoHire</title>
        <meta name="description" content="Find and create task" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="App">
            <LoadingBar open={loading} />
            {taskOpen && (
            <TaskPopup
                taskID={taskID}
                hooks={hooks}
                open={taskOpen}
                setOpen={setTaskOpen}
                setLoading={setLoading}
                tastDetail={tastDetail}
                PK={PK}
            />
            )}
            {namecardOpen && (
            <NamecardPopup
                address={get(accounts, "[0]", "")}
                hooks={hooks}
                type={nameCardType}
                open={namecardOpen}
                setOpen={setNamecardOpen}
                setLoading={setLoading}
            />
            )}
            {friendOpen && (
            <FriendPopup
                setLoading={setLoading}
                hooks={hooks}
                open={friendOpen}
                setOpen={setFriendOpen}
            />
            )}
            {addTaskOpen && (
            <AddTaskPopup
                hooks={hooks}
                open={addTaskOpen}
                setOpen={setAddTaskOpen}
                setLoading={setLoading}
            />
            )}
            <NavBar
              connect={() => connectWallet(true)}
              disconnect={() => connectWallet(false)}
              hooks={hooks}
              searchVal={search}
              onSearch={(newVal) => setSearch(newVal)}
              navigate={(type: string) => navigate(type)}
            />
            {all ? (
            <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:divide-y lg:divide-gray-200 lg:px-8">
                <div className="mt-6 grid grid-cols-1 gap-y-6 sm:grid-cols-12 sm:grid-rows-3 sm:gap-x-6 lg:gap-8">
                {login ? (
                    <>
                    <div className="group row-span-3 col-span-12 lg:col-span-9  aspect-w-2 aspect-h-1 rounded-lg overflow-hidden sm:aspect-h-1 sm:aspect-w-1">
                        <Header
                        hooks={hooks}
                        disconnect={() => connectWallet(false)}
                        navigate={(type: string) => navigate(type)}
                        />
                    </div>
                    <div className="group aspect-w-2 aspect-h-1 col-span-12 sm:col-span-4 lg:col-span-3 rounded-lg overflow-hidden sm:relative sm:aspect-none sm:h-full">
                        <MenuButton
                        icon="task"
                        name="My Tasks"
                        subText="Tasks dashboard"
                        noti={1}
                        onClick={() => navigate("tasks")}
                        />
                    </div>
                    <div className="group aspect-w-2 aspect-h-1 col-span-12 sm:col-span-4 lg:col-span-3 rounded-lg overflow-hidden sm:relative sm:aspect-none sm:h-full">
                        <MenuButton
                        icon="resume"
                        name="Resume"
                        subText="View my resume"
                        onClick={() => navigate("resume")}
                        />
                    </div>
                    <div className="group aspect-w-2 aspect-h-1 col-span-12 sm:col-span-4 lg:col-span-3 rounded-lg overflow-hidden sm:relative sm:aspect-none sm:h-full">
                        <MenuButton
                        icon="connect"
                        name="Connect"
                        subText="View my connection"
                        noti={1}
                        onClick={() => navigate("friend")}
                        />
                    </div>
                    </>
                ) : (
                    <div className="group row-span-3 col-span-12 aspect-w-2 aspect-h-1 rounded-lg overflow-hidden">
                    <ConnectHeader connect={() => connectWallet(true)} />
                    </div>
                )}
                </div>

                <div
                className="relative pt-10 pb-10 lg:pt-24 lg:pb-28"
                style={{ borderTop: 0 }}
                >
                <div className="absolute inset-0">
                    <div className="bg-white h-1/3 sm:h-2/3" />
                </div>
                <div className="relative max-w-7xl mx-auto">
                    <div className="text-left">
                    <h2 className="text-2xl tracking-tight font-bold text-gray-900 sm:text-4xl">
                        Active Jobs
                        <button
                        onClick={() => navigate("submitTask")}
                        className="mt-1 align-top relative ml-4 w-8 h-8 border-black border-t-2 border-x-2 border-b-4 rounded-full text-center"
                        >
                        <PlusSmIcon
                            className="position-center h-8 w-8"
                            aria-hidden="true"
                        />
                        </button>
                    </h2>
                    <div className="mt-3 flex items-center">
                        <div className="flex-shrink-1">
                        <TabBar
                            nameList={jobTypes}
                            value={filter}
                            onChange={(newValue) => setFilter(newValue)}
                        />
                        </div>
                        <div className="ml-auto flex-shrink-0 text-black pl-12">
                        <button
                            onClick={() => setBookmark(!bookmark)}
                            className={`ease-in duration-100 mt-1 align-top relative ml-4 w-12 h-12 border-black border-t-2 border-x-2 border-b-4 rounded-full text-center ${
                            bookmark && "bg-black"
                            }`}
                        >
                            <BookmarkIcon
                            className="position-center h-8 w-8"
                            aria-hidden="true"
                            color={bookmark ? "white" : "black"}
                            />
                        </button>
                        </div>
                    </div>
                    </div>
                    <div className="mt-12 mx-auto grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:max-w-none">
                    {filterData.map((item: any) => (
                        <TaskCard
                        key={get(item, "PK", "")}
                        type={
                            get(item, "bookmark", []).includes(
                            get(accounts, "[0]", "")
                            )
                            ? "bookmarked"
                            : "bookmark"
                        }
                        createDate={get(item, "createTime", 0)}
                        jobName={get(item, "postName", "")}
                        jobType={get(item, "jobType.value", "")}
                        userBookmarked={get(item, "bookmark", []).length}
                        userView={get(item, "apply", []).length}
                        slack={get(item, "stacks", []).map((stack: any) =>
                            get(stack, "value", "")
                        )}
                        onBookmark={(bookmark: boolean) =>
                            updateBookmark(item.PK, bookmark)
                        }
                        onClick={() => taskDetailOpen(item)}
                        />
                        ))}
                    </div>
                </div>
                </div>
            </div>
            ) : (
            <div
                className="relative pt-10 pb-10 lg:pt-24 lg:pb-28"
                style={{ borderTop: 0 }}
            >
                <div className="absolute inset-0">
                <div className="bg-white h-1/3 sm:h-2/3" />
                </div>
                <div className="relative max-w-7xl mx-auto">
                <div className="text-left">
                    <h2 className="text-2xl tracking-tight font-bold text-gray-900 sm:text-4xl">
                    My Tasks
                    <button
                        onClick={() => setAll(true)}
                        className="mt-2 text-xl px-4 align-top relative ml-4 bg-black text-white rounded-full text-center"
                    >
                        Home
                    </button>
                    </h2>
                </div>
                <div className="mt-12 mx-auto grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:max-w-none">
                    {filterData.map((item: any) => (
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
                        onBookmark={(bookmark: boolean) =>
                        updateBookmark(item.PK, bookmark)
                        }
                        onClick={() => taskDetailOpen(item)}
                    />
                    ))}
                </div>
                </div>
            </div>
            )}
      </div>
    </div>
  );
};

export default JobPage;