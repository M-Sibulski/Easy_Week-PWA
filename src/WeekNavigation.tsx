import { dateToInputType } from "./dateConversions";

interface Props {
    week: {weekStart: Date, weekEnd: Date};
    navBack: () => void;
    navForward: () => void;
}

const WeekNavigation = ({week, navBack, navForward}:Props) => {
    
  return (
    <div className="p-1 flex flex-cols justify-between bg-blue-300 items-center">
        <button onClick={navBack} className="cursor-pointer h-full p-1 rounded-md hover:bg-blue-400">
            <svg height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000ff"><path d="M640-80 240-480l400-400 71 71-329 329 329 329-71 71Z"/></svg>
        </button>
        <p className="font-bold text-lg">{dateToInputType(week.weekStart)} - {dateToInputType(week.weekEnd)}</p>
        <button onClick={navForward} className="cursor-pointer h-full p-1 rounded-md hover:bg-blue-400">
            <svg height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000ff"><path d="m321-80-71-71 329-329-329-329 71-71 400 400L321-80Z"/></svg>
        </button>
    </div>
  )
}

export default WeekNavigation;