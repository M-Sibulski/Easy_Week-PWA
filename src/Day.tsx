import { Accounts, Transactions } from "../types";
import Transaction from "./Transaction";

interface Props {
    transactions: Transactions[];
    total: number;
    date: string;
    accounts: Accounts[] | undefined;
}

const Day = ({transactions, total, date, accounts}:Props) => {
  return (
    <div data-testid="day" className='rounded-xl bg-gray-50 shadow-md md:max-w-2x1 flex flex-col p-1 gap-1'>
        <h3 className="font-bold text-lg">{date}</h3>
        <div className="h-0.5 bg-linear-to-r from-gray-50 via-gray-100 to-gray-50 w-full self-center "/>
        <div className='flex flex-col gap-3'>
        {transactions && transactions.map(t => 
            <Transaction key={t.id} transaction={t} accounts={accounts}/>
        )}
        </div>
        <div className="h-0.5 bg-linear-to-r from-gray-50 via-gray-100 to-gray-50 w-full self-center "/>
        <h3 data-testid="total" className="text-right font-bold text-lg text-gray-700 mx-1">{(total < 0 ? '- $' : '$') + Math.abs(total).toFixed(2)}</h3>
    </div>
  )
}

export default Day;