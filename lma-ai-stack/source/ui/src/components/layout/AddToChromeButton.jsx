import React from 'react';

const AddToChromeButton = () => {
  return (
    <div className="flex flex-col items-start gap-y-1 border-t border-slate-200 px-6 py-5 text-left md:flex-col md:gap-y-2 md:py-3">
      <div className="flex flex-row items-start gap-x-4 gap-y-2 md:flex-col">
        <div className="flex flex-row gap-1 text-sm font-medium text-slate-600">
          <button
            type="button"
            className="inline-flex items-center rounded-lg text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 whitespace-nowrap w-fit h-fit text-indigo-600 font-medium hover:text-indigo-500 gap-x-1 px-0 py-0"
          >
            <span>Add to Chrome</span>
          </button>
          <span>to use with</span>
        </div>
        <div className="flex flex-row items-center gap-2">
          <img className="w-6 h-6" src="/googlemeet-I1Ev_7Ry.png" alt="Google Meet" />
          <img className="w-6 h-6" src="/zoom-DYTZLxt7.png" alt="Zoom" />
          <img className="w-6 h-6" src="/msteams-JcLsOdPU.png" alt="Microsoft Teams" />
        </div>
      </div>
    </div>
  );
};

export default AddToChromeButton;
