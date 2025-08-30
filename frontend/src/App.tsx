import { Header } from "./components/Header";
import { TokenForm } from "./components/TokenForm";
import { DeployedTokensList } from "./components/DeployedTokensList";

function App() {
  return (
    <div>
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <TokenForm />
          <DeployedTokensList />
        </div>
      </main>
    </div>
  );
}

export default App;
