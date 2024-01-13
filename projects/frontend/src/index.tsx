import { createRoot } from "react-dom/client";
import { useState } from "react";

function start() {
  return new Promise((resolve) => {
    setTimeout(resolve, 600);
  });
}

function App() {
  let [state, setState] = useState({ label: "idle" });
  let onStart = async () => {
    setState({ label: "starting" });
    await start();
    setState({ label: "started" });
  };
  return (
    <div>
      <div>label: {state.label}</div>
      <button onClick={onStart}>start</button>
    </div>
  );
}

// Render your React component instead
const root = createRoot((document as any).getElementById("app"));

root.render(<App />);
