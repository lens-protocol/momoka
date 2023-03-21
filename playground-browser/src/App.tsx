import {
  checkDAProof,
  Deployment,
  Environment,
  EthereumNode,
} from '@lens-protocol/data-availability-verifier/client';
import './App.css';

const ethereumNode: EthereumNode = {
  environment: Environment.MUMBAI,
  nodeUrl: 'https://polygon-mumbai.g.alchemy.com/v2/lvrU-S7p7QDU-TMpm1JeZNbgyIphNx3h',
  deployment: Deployment.STAGING,
};

const check = async () => {
  const result = await checkDAProof('VlPh9JdZ2SNcnWaqgHFRfycT8xpuoX2MR5LnI95f87w', ethereumNode);
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
