import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Header } from "./components/Header";
import { TokenForm } from "./components/TokenForm";
import { DeployedTokensList } from "./components/DeployedTokensList";
import { TokenPage } from "./pages/TokenPage";

function HomePage() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <TokenForm />
        <DeployedTokensList />
      </div>
    </main>
  );
}

function App() {
  return (
    <Router>
      <div>
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/token/:address" element={<TokenPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
