import { useEffect, useRef, useState } from "react";
import { Accounts, Settings } from "../types";
import { dateToInputType } from "./dateConversions";
import CreateAccount from "./CreateAccount";
import EditAccount from "./EditAccount";
import jsonToDB from "./JsonImport";

interface Props {
    accountId: number;
    total: number;
    accounts: Accounts[] | undefined;
    changeAccount: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    settings: Settings | undefined;
}


const Account = ({accountId, total, accounts, changeAccount, settings}:Props) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditAccountOpen, setIsEditAccountOpen] = useState(false);
  const [isCreateAccountOpen, setIsCreateAccountOpen] = useState(false);
  const [currentAccount, setCurrentAccount] = useState(accounts?.find(a => a.id === accountId));
  const formRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    setCurrentAccount(accounts?.find(a => a.id === accountId));
  }, [accountId, accounts])

  const closeCreateMenu = () => {
    setIsCreateAccountOpen(false)
  }

  const closeEditMenu = () => {
    setIsEditAccountOpen(false)
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

  useEffect(() => {
    if(accounts && accounts.length === 0) setIsCreateAccountOpen(true);
  }, [accounts])


  return (
    
    <div data-testid="account" className='bg-blue-500 flex flex-col p-2'>
      
      {isMenuOpen && 
        <div ref={formRef} className='z-30 flex absolute right-2 top-2 rounded-lg shadow-lg/20 cursor-pointer bg-blue-300 p-2 gap-1'>
          <ul>
            <li onClick={() => {setIsEditAccountOpen(true); setIsMenuOpen(false)}} className="cursor-pointer p-1 rounded-md hover:bg-blue-400 select-none">Edit Account</li>
            <li onClick={() => {setIsCreateAccountOpen(true); setIsMenuOpen(false)}} className="cursor-pointer p-1 rounded-md hover:bg-blue-400 select-none">Create Account</li>
            <label htmlFor="file-input" className="cursor-pointer p-1 rounded-md hover:bg-blue-400 select-none">Import JSON</label>
            <input id="file-input" type="file" accept=".json, .csv" onChange={(e) => {jsonToDB(e.target.files?.[0], accountId); setIsMenuOpen(false)}} className="hidden"/>
            
          </ul>
        </div>
      }
      {(accounts && accounts.length > 0) ?
      <>
      <div className="z-10 flex flex-row justify-between">
        {(accounts && accounts?.length > 0) && <select value={currentAccount?.id} onChange={e => changeAccount(e)} className="font-bold text-lg text-white">
          {accounts.map(a => <option key={a.id} className="text-black" value={a.id}>{a.name}</option>)}
        </select>}
        
        <button onClick={() => setIsMenuOpen(true)} role='close' name='close' className="cursor-pointer h-full p-1 rounded-md hover:bg-blue-400 self-end">
          <svg height="24px" viewBox="0 -960 960 960" width="24px" fill="#f9fafb"><path d="M480-160q-33 0-56.5-23.5T400-240q0-33 23.5-56.5T480-320q33 0 56.5 23.5T560-240q0 33-23.5 56.5T480-160Zm0-240q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm0-240q-33 0-56.5-23.5T400-720q0-33 23.5-56.5T480-800q33 0 56.5 23.5T560-720q0 33-23.5 56.5T480-640Z"/></svg>
        </button>
      </div>
        {currentAccount?.goalValue && <p className="text-white">Goal: {'$' + Math.abs(currentAccount.goalValue)}{currentAccount?.goalDate && (" by " + dateToInputType(currentAccount.goalDate))}</p>}
        <h3 data-testid="total" className="text-right font-bold text-lg text-gray-700 mx-1 text-white">{total && ((total < 0 ? '- $' : '$') + Math.abs(total).toFixed(2))}</h3>
        </> : <p className="p-1 flex-1 text-white text-lg text-center select-none">Create Account</p>
      }
      {isCreateAccountOpen && <CreateAccount open={isCreateAccountOpen} callback={closeCreateMenu} settings={settings}/>}
      {isEditAccountOpen && <EditAccount open={isEditAccountOpen} callback={closeEditMenu} settings={settings} account={currentAccount}/>}
      
    </div>
  )
}

export default Account;