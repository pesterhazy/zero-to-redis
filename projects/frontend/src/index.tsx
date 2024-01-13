import { createRoot } from "react-dom/client";

function App() {
  return (
    <div>
      <h1>Hello, world</h1>
      <button>Start Redis</button>
    </div>
  );
}

// Render your React component instead
const root = createRoot((document as any).getElementById("app"));

root.render(<App />);
