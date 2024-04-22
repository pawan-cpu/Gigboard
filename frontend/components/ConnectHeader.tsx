import React from 'react';

import moment from "moment";

const ConnectHeader = ({ connect }: {connect: () => void }) => {

  const greeting = moment().hour() > 18 || moment().hour() < 6 ? "GN!☽" : "GM!☀";

  return (
    <div className="border-black text-white bg-blue border-2 rounded-lg shadow-xl overflow-hidden grid grid-cols-5 gap-4">
      <div className="pt-10 pb-12 px-6 sm:pt-16 sm:px-16 lg:py-16 lg:pr-0 xl:py-20 xl:pl-20 select-none col-span-3">
        <div className="lg:self-center">
          <h2>
            <span className="block font-extrabold text-5xl md:text-8xl">
              {greeting}
            </span>
            <span className="block font-medium text-xl md:text-3xl">
              Connect Your Wallet!
            </span>
          </h2>
          <button
            onClick={() => connect()}
            className="mt-8 bg-white border-x-2 border-t-2 border-b-4 border-black rounded-md px-3 inline-flex items-center text-base font-bold text-black hove:bg-gray-200"
          >
            Connect Wallet
          </button>
        </div>
      </div>
      <div className="-mt-6 aspect-w-5 col-span-2 flex justify-center items-center">
        <img 
          className="object-cover w-full -scale-x-1"
          src="/assets/img/banner-3.svg"
          alt="Avatar"
        />
      </div>
    </div>
  );
};

export default ConnectHeader;