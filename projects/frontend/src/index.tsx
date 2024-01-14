import { createRoot } from "react-dom/client";
import { useState, useEffect } from "react";

let baseUrl = "http://localhost:4004";

async function find() {
  let result = await fetch(baseUrl + "/find", { method: "POST" });
  if (!result.ok) throw "Fetch failed";
  return await result.json();
}

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
  let [state, setState] = useState({ label: "initial" });
  console.log(state);

  useEffect(() => {
    if (state.label === "initial") {
      async function load() {
        let result = await find();

        console.log("result", result);
      }
      setState({ label: "loading" });
      load();
    }
  });
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
    } else if (state.label === "initial" || state.label === "loading") {
      return <button disabled={true}>loading</button>;
    } else {
      throw Error("Unknown state:" + state.label);
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
