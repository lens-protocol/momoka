import {
  checkDAProof,
  Deployment,
  Environment,
  EthereumNode,
} from '@lens-protocol/data-availability-verifier/lib/client';
import './App.css';

const ethereumNode: EthereumNode = {
  environment: Environment.MUMBAI,
  nodeUrl: 'https://polygon-mumbai.g.alchemy.com/v2/lvrU-S7p7QDU-TMpm1JeZNbgyIphNx3h',
  deployment: Deployment.STAGING,
};

const check = async () => {
  const result = await checkDAProof('SgrwJz3aL5yZwu4cOFoJKTqUKGe8vPyh1MPumyMTx-8', ethereumNode);
  if (result.isSuccess()) {
    console.log('proof valid', result.successResult!);
  }

  // it failed!
  console.error('proof invalid do something', result.failure!);

  console.log(ethereumNode);
};

check();

function App() {
  return (
    <div className="App">
      <header className="App-header">
        {/* <img src={logo} className="App-logo" alt="logo" /> */}
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
