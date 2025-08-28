import { useState } from "react";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <h1 className="">Count: {count}</h1>
      <button
        className="m-2 p-2 text-black hover:text-white bg-blue-400 hover:bg-blue-600 rounded cursor-pointer active:bg-blue-700"
        onClick={() => setCount((count) => count + 1)}
      >
        Increase
      </button>
    </div>
  );
}

export default App;
