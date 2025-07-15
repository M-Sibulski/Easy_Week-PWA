import { useEffect } from 'react'
import reactLogo from './assets/react.svg'
import appLogo from '/favicon.svg'
import PWABadge from './PWABadge.tsx'
import './App.css'
import { db } from '../db.ts';
import { useLiveQuery } from 'dexie-react-hooks';

function App() {
  // const [count, setCount] = useState(0);
  const countRow = useLiveQuery(() => db.count.get(1));
  
  useEffect(() => {
    // console.log(countRow);
    if (countRow === undefined) return;
    if(!countRow) {
        db.count.put({id: 1, value: 0}); 
    }
  }, [countRow]);

  const addCount = async () => {
    // setCount((count) => count + 1);
    // console.log('button clicked');
    // console.log(countRow?.value);
    const currentValue = countRow?.value ?? 0;
    // console.log(currentValue);
    db.count.put({id:1, value: currentValue + 1});
    
  }

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={appLogo} className="logo" alt="vite-project logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>vite-project</h1>
      <div className="card">
        <button data-testid="counter-button" onClick={() => addCount()}>
          count is {countRow?.value ? countRow?.value.toString() : '0'}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more2
      </p>
      <PWABadge />
    </>
  )
}

export default App
