import PWABadge from './PWABadge.tsx';
import './App.css';
import Mainscreen from './Mainscreen.tsx';
import { useEffect } from 'react';
import { setViewportHeightVariable } from './setViewportHeight.ts';

function App() {
  useEffect(() => {
    setViewportHeightVariable();
  }, []);

  return (
    <div data-testid='app' className='sm:mx-auto sm:max-w-lg sm:py-5 overflow-y-hidden h-[calc(var(--vh,1vh)*100)]'>
      <div className='relative sm:my-1 mx-auto overflow-y-hidden h-full w-full sm:rounded-2xl shadow-lg/20 flex flex-col'>
        <Mainscreen/>
        <PWABadge />
      </div>
    </div>
  )
}

export default App
