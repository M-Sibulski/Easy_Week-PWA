import { useEffect, useRef, useState } from "react";
import { Accounts, Settings, Transactions } from "../types";
import { dateToInputType, dateToTitle, getNextWeekRange, getPrevWeekRange, getWeek } from "./dateConversions";
import WeekNavigation from "./WeekNavigation";
import Day from "./Day";

interface Props {
    transactions: Transactions[];
    accounts: Accounts[] | undefined;
    settings: Settings | undefined;
    handleScroll: (e: React.UIEvent<HTMLDivElement, UIEvent>) => void
}

const WeekScreen = ({transactions, accounts, settings, handleScroll}:Props) => {
    const [week, setWeek] = useState({weekStart: new Date(), weekEnd: new Date()})
    const weekTransactions: Transactions[] = transactions ? transactions.filter(t => t.date >= week.weekStart && t.date <= week.weekEnd) : [];
    const dateNames = weekTransactions ? Array.from(new Set(weekTransactions.map(t => dateToInputType(t.date)))) : [];
    const scrollDemoRef = useRef(null);
    const today = new Date();
    useEffect(() => {
        if (settings) setWeek(getWeek(today, settings.week_starting_day))
    }, [settings])

    const handleNavBack = () => {
        setWeek(getPrevWeekRange(week))
    }

    const handleNavForward = () => {
        setWeek(getNextWeekRange(week))
    }

  return (
    <div className="flex flex-col overflow-y-hidden flex-1">
        <WeekNavigation week={week} navBack={handleNavBack} navForward={handleNavForward}/>
        <div ref={scrollDemoRef} onScroll={handleScroll} id='statement-screen' className='flex-1 overflow-y-auto flex flex-col gap-2 p-1 bg-gray-300 box-border'>
          {dateNames.map(d => <Day key={d} date={dateToTitle(new Date(d))} transactions={weekTransactions.filter((t2 => dateToInputType(t2.date) == d))} accounts={accounts} total={weekTransactions.filter(t => dateToInputType(t.date) <= d).reduce((accumulator, transaction) => accumulator + transaction.value, 0)}/>)}
        </div>
    </div>
  )
}

export default WeekScreen;