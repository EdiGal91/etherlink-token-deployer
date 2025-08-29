import { Header } from "./components/Header";
import { TokenForm } from "./components/TokenForm";

function App() {
  return (
    <div>
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TokenForm />
      </main>
    </div>
  );
}

export default App;
