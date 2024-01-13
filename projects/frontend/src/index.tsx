import { createRoot } from "react-dom/client";
import { useState } from "react";

function start() {
  return new Promise((resolve) => {
    setTimeout(resolve, 600);
  });
}

function stop() {
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
  let onStop = async () => {
    setState({ label: "stopping" });
    await stop();
    setState({ label: "idle" });
  };
  let MyButton = () => {
    if (state.label === "idle") {
      return <button onClick={onStart}>start</button>;
    } else if (state.label === "starting") {
      return <button disabled={true}>start</button>;
    } else if (state.label === "started") {
      return <button onClick={onStop}>stop</button>;
    } else if (state.label === "stopping") {
      return <button disabled={true}>stop</button>;
    } else {
      throw Error("Unknown state");
    }
  };
  return (
    <div>
      <div>label: {state.label}</div>
      <MyButton />
    </div>
  );
}

// Render your React component instead
const root = createRoot((document as any).getElementById("app"));

root.render(<App />);
