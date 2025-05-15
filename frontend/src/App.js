import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          This is a test!
        </p>
        <a
          className="App-link"
          href="https://google.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          Google
        </a>
      </header>
    </div>
  );
}

export default App;
