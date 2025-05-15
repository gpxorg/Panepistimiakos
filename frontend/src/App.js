import './App.css';
import Navbar from './components/Navbar'

import * as React from 'react';


function App() {
  return (
    <div className="App">
      <div className="Header-container">
        <header className="App-header">
          <Navbar />
        </header>
      </div>

      <div className="Body-container">
        <div className="App-body">
            <p> hello world 2 </p>
        </div>
      </div>
    </div>
  );
}


export default App;
