import PWABadge from './PWABadge.tsx';
import './App.css';
import Mainscreen from './Mainscreen.tsx';
import CreateTransaction from './CreateTransaction.tsx';

function App() {

  return (
    <div className='mx-auto max-w-lg sm:py-5 overflow-y-hidden h-full'>
      <div className='relative my-1 mx-auto max-w-lg overflow-y-hidden h-full '>
        <Mainscreen/>
        <PWABadge />
        <CreateTransaction/>
      </div>
    </div>
  )
}

export default App
