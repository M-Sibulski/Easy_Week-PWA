import { useEffect, useRef, useState } from "react";
import { Accounts } from "../db";
import { dateToInputType } from "./dateConversions";
import CreateAccount from "./CreateAccount";

interface Props {
    accountId: number;
    total: number;
    accounts: Accounts[] | undefined;
    changeAccount: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}


const Account = ({accountId, total, accounts, changeAccount}:Props) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditAccountOpen, setIsEditAccountOpen] = useState(false);
  const [isCreateAccountOpen, setIsCreateAccountOpen] = useState(false);
  const currentAccount = accounts?.find(a => a.id === accountId);
  const goalValue = currentAccount?.goalValue;
  const goalDate = currentAccount?.goalDate;
  const formRef = useRef<HTMLDivElement>(null);

  const closeCreateMenu = () => {
    setIsCreateAccountOpen(false)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (formRef.current && !formRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
        }
    };

    if (isMenuOpen) {
        document.addEventListener('mousedown', handleClickOutside);
    } else {
        document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);



  return (
    <div data-testid="account" className='bg-blue-500 flex flex-col p-2'>
      {isMenuOpen && 
        <div ref={formRef} className='z-30 flex absolute right-2 top-2 rounded-lg shadow-lg/20 cursor-pointer bg-blue-300 p-2 gap-1'>
          <ul>
            <li onClick={() => {setIsEditAccountOpen(true); setIsMenuOpen(false)}} className="cursor-pointer p-1 rounded-md hover:bg-blue-400">Edit Account</li>
            <li onClick={() => {setIsCreateAccountOpen(true); setIsMenuOpen(false)}} className="cursor-pointer p-1 rounded-md hover:bg-blue-400">Create Account</li>
          </ul>
        </div>
      }
      <div className="z-10 flex flex-row justify-between">
        {(accounts && accounts?.length > 0) && <select onChange={e => changeAccount(e)} className="font-bold text-lg text-white">
          {accounts.map(a => <option key={a.id} className="text-black" value={a.id}>{a.name}</option>)}
        </select>}
        <button onClick={() => setIsMenuOpen(true)} role='close' name='close' className="cursor-pointer h-full p-1 rounded-md hover:bg-blue-400">
          <svg height="24px" viewBox="0 -960 960 960" width="24px" fill="#f9fafb"><path d="M480-160q-33 0-56.5-23.5T400-240q0-33 23.5-56.5T480-320q33 0 56.5 23.5T560-240q0 33-23.5 56.5T480-160Zm0-240q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm0-240q-33 0-56.5-23.5T400-720q0-33 23.5-56.5T480-800q33 0 56.5 23.5T560-720q0 33-23.5 56.5T480-640Z"/></svg>
        </button>
      </div>
        {goalValue && <p className="text-white">Goal: {'$' + Math.abs(goalValue)}{goalDate && (" by " + dateToInputType(goalDate))}</p>}
        <h3 data-testid="total" className="text-right font-bold text-lg text-gray-700 mx-1 text-white">{total && ((total < 0 ? '- $' : '$') + Math.abs(total))}</h3>
      {isCreateAccountOpen && <CreateAccount open={isEditAccountOpen} callback={closeCreateMenu}/>}
    </div>
    
  )
}

export default Account;