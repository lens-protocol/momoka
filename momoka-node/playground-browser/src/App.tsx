import {
  checkDAProof,
  Deployment,
  Environment,
  EthereumNode,
} from '@lens-protocol/data-availability-verifier/client';
import './App.css';

const ethereumNode: EthereumNode = {
  environment: Environment.AMOY,
  nodeUrl: 'INSERT_NODE_URL_HERE',
  deployment: Deployment.STAGING,
};

const check = async () => {
  const result = await checkDAProof('VlPh9JdZ2SNcnWaqgHFRfycT8xpuoX2MR5LnI95f87w', ethereumNode);
  if (result.isSuccess()) {
    console.log('proof valid', result.successResult);
    return;
  }

  // it failed!
  console.error('proof invalid do something', result.failure);

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
