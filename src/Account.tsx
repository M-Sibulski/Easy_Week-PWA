import { Accounts } from "../db";
import { AccountsTotals } from "./Mainscreen";

interface Props {
    accountId: number;
    totals: AccountsTotals[];
    accounts: Accounts[] | undefined;
    changeAccount: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}


const Account = ({accountId, totals, accounts, changeAccount}:Props) => {
  const total = totals.find(a => a.id === accountId)?.total;
  console.log({accountId})
  console.log({totals})
  console.log({accounts})
  return (
    <div data-testid="account" className='bg-blue-500 flex flex-col p-2'>
        {/* <h3 className="font-bold text-lg text-white">Account: {accountId}</h3> */}
        {(accounts && accounts?.length > 0) && <select onChange={e => changeAccount(e)} className="font-bold text-lg text-white">
          {accounts.map(a => <option key={a.id} className="text-black" value={a.id}>{a.name}</option>)}
        </select>}
        <h3 data-testid="total" className="text-right font-bold text-lg text-gray-700 mx-1 text-white">{total && ((total < 0 ? '- $' : '$') + Math.abs(total))}</h3>
    </div>
  )
}

export default Account;