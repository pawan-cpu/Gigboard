import React from 'react';

interface LoadingBarProps {
  open: boolean;
}

const LoadingBar: React.FC<LoadingBarProps> = ({ open }) => {
  return (
    <>
      {open && (
        <div className="z-20 fixed top-0 left-0 w-full h-full">
          <div className="absolute bg-white opacity-75 top-0 left-0 w-full h-full" />
            <img 
              className="absolute position-center"
              src="/assets/icon/loading.gif"
              alt="loading"
            />
        </div>
      )}
    </>
  );
};

export default LoadingBar