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
    <div className='rounded-xl bg-gray-50 shadow-md md:max-w-2x1 flex flex-col p-1'>
        <h3 className="text-center">{date}</h3>
        <div className="h-0.5 bg-linear-to-r from-gray-50 via-gray-100 to-gray-50 w-full self-center "/>
        {transactions && transactions.map(t => {
            return (
                <>
            <Transaction key={t.id} transaction={t}/>
            <div className="h-0.5 bg-linear-to-r from-gray-50 via-gray-100 to-gray-50 w-full self-center "/>
            </>
        );}
            )
        }
        <h3 className="text-right">{total}</h3>
    </div>
  )
}

export default Mainscreen;