import React from 'react';
import moment from 'moment';
import { get } from 'lodash';
import {
  BookmarkIcon,
  CalendarIcon,
  UserIcon,
  CheckIcon,
  LightningBoltIcon,
  XIcon,
} from "@heroicons/react/outline";

import { jobTypes } from '../data/options';

interface TaskCardProps {
  type: "bookmark" | "bookmarked" | "finished" | "failed" | "pending" | "started";
  createDate: number;
  jobType: string;
  jobName: string;
  userView: number;
  userBookmarked: number;
  slack: Array<string>;
  onClick: () => void;
  onBookmark?: (bookmark: boolean) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({
  type,
  createDate,
  jobName,
  jobType,
  userView,
  userBookmarked,
  slack,
  onClick,
  onBookmark,
}) => {

  const iconType = {
    bookmark: (
      <button className="hover:bg-grey-500 bg-white -mt-1 top-0 right-0 absolute w-14 h-14 border-black border-t-2 border-x-2 border-b-4 rounded-lg text-center">
        <BookmarkIcon 
          onClick={onBookmark && (() => onBookmark(true))}
          className="position-center h-8 w-8"
          aria-hidden="true"
        />
      </button>
    ),
    bookmarked: (
      <button className="hover:bg-grey-500 bg-black -mt-1 -mr-1 top-0 right-0 absolute w-14 h-14 border-black border-t-2 border-x-2 border-b-4 rounded-lg text-center">
        <BookmarkIcon 
          color="white"
          onClick={onBookmark && (() => onBookmark(false))}
          className="position-center h-8 w-8"
          aria-hidden="true"
        />
      </button>
    ),
    started: (
      <button className="cursor-default bg-light-yellow -mt-1 -mr-1 top-0 right-0 absolute w-14 h-14 border-black border-t-2 border-x-2 border-b-4 rounded-lg text-center">
        <BookmarkIcon 
          color="white"
          onClick={onBookmark && (() => onBookmark(false))}
          className="position-center h-8 w-8"
          aria-hidden="true"
        />
      </button>
    ),
    pending: (
      <button className="cursor-default bg-light-yellow -mt-1 -mr-1 top-0 right-0 absolute w-14 h-14 border-t-2 border-x-2 border-b-4 rounded-lg text-center">
        <LightningBoltIcon className="position-center h-8 w-8" aria-hidden="true" />
      </button>
    ),
    finished: (
      <button className="cursor-default hover:bg-grey-500 bg-success -mt-1 -mr-1 top-0 right-0 absolute w-14 h-14 border-black border-t-2 border-x-2 border-b-4 rounded-lg text-center">
        <CheckIcon className="position-center h-8 w-8" aria-hidden="true" />
      </button>
    ),
    failed: (
      <button className="cursor-default hover:bg-grey-500 bg-fail -mt-1 -mr-1 top-0 right-0 absolute w-14 h-14 border-black border-t-2 border-x-2 border-b-4 rounded-lg text-center">
        <XIcon className="position-center h-8 w-8" aria-hidden="true" />
      </button>
    ),
  };
  const colorMap = {
    yellow: "#FBBF16",
    "light-yellow": "#F9F8CB",
    green: "#00C6AD",
    red: "#F85A2A",
    white: "#FFF",
  };
  const jobFormat = jobTypes.find((item: any) => item.name === jobType);

  return (
    <div className="select-none flex flex-col rounded-lg overflow-hidden border-t-2 border-x-2 border-b-4 border-black">
      <div className="flex-shrink-0">
        <div
          className={`relative h-48 w-full border-b-2 border-black p-6`}
          style={{
            backgroundColor: get(colorMap, `[${jobFormat?.color}]`, "white"),
          }}
        >
          {iconType[type]}
          <p>
            <CalendarIcon 
              className="h-8 w-8 text-black inline-block align-middle"
              aria-hidden="true"
            />
            <span className="font-bold text-xl inline-block align-middle ml-2 mt-1">
              {moment.unix(createDate).format("DD/MM")}
            </span>
          </p>
          <div className="absolute bottom-0 left-0 w-full px-6 py-6 max-h-24 font-bold text-2xl">
            {jobName}
          </div>
        </div>
      </div>
      <div className="bg-white p-6">
        <div className="grid gap-y-4 grid-cols-3 grid-rows-2 gap-x-4">
          <div className="col-span-2">
            <UserIcon 
              className="h-6 w-6 text-black inline-block align-middle"
              aria-hidden="true"
            />
            <span className="text-lg inline-block align-middle ml-2">
              {userView.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            </span>
            <BookmarkIcon 
              className="h-6 w-6 text-black inline-block align-middle ml-8"
              aria-hidden="true"
            />
            <span className="text-lg inline-block align-middle ml-2">
              {userBookmarked.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            </span>
          </div>
          <div className="col-span-1 row-span-2 relative">
            <div className="ml-auto relative w-24 h-24 rounded-full border-black border-t-2 border-x-2 border-b-4 text-center">
              <img 
                src={`/assets/stack/stack_${slack[0]}.png`}
                className="position-center w-4/5"
                alt="Slack Icon"
              />
            </div>
          </div>
          <div className="col-span-2 row-span-1">
            <button
              onClick={() => onClick()}
              className="font-bold text-base w-full border-black border-t-2 border-x-2 border-b-4 text-center rounded-lg py-1"
            >
              View
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;