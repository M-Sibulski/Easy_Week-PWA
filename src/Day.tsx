// import { useLiveQuery } from "dexie-react-hooks";
import { Transactions } from "../db";
import Transaction from "./Transaction";

interface Props {
    transactions: Transactions[];
    total: number;
    date: string;
}

const Mainscreen = ({transactions, total, date}:Props) => {
    console.log('Day');

  return (
    <div className='relative overflow-hidden rounded-xl bg-gray-50 shadow-md md:max-w-2x1 flex flex-col min-h-full gap-1 p-1'>
        <h3 className="text-center">{date}</h3>
        {transactions && transactions.map(t => <Transaction key={t.id} transaction={t}/>)}
        <h3 className="text-right">{total}</h3>
    </div>
  )
}

export default Mainscreen;