import { createRoot } from "react-dom/client";
import { useState, useEffect } from "react";

let baseUrl = "http://localhost:4004";

function timeout(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function find() {
  let result = await fetch(baseUrl + "/find", { method: "POST" });
  if (!result.ok) throw "Fetch failed";
  return await result.json();
}

async function start() {
  let result = await fetch(baseUrl + "/start", { method: "POST" });
  if (!result.ok) throw "Fetch failed";
  return await result.json();
}

async function stop(id) {
  let result = await fetch(baseUrl + "/stop", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id }),
  });
  if (!result.ok) throw "Fetch failed";
  return await result.json();
}

function StartedView({ data }) {
  return (
    <pre>
      name: {data.redis.projectName}
      <br />
      redis url: {data.variables.variables.REDIS_URL}
      <br />
    </pre>
  );
}

function App() {
  let [state, setState] = useState({ label: "initial" });
  console.log(state);

  async function load() {
    let result = await find();
    if ("redis" in result) {
      setState({ label: "started", data: result });
    } else {
      setState({ label: "idle" });
    }
  }

  useEffect(() => {
    if (state.label === "initial") {
      setState({ label: "loading" });
      load();
    }
  });
  let onStart = async () => {
    setState({ label: "starting" });
    await start();
    // HACK: the project doesn't always show up once the workflows completes
    await timeout(3000);
    await load();
  };
  let onStop = async () => {
    setState({ label: "stopping" });
    await stop(state.data.redis.projectId);
    setState({ label: "idle" });
  };
  let MyButton = () => {
    if (state.label === "idle") {
      return <button onClick={onStart}>start</button>;
    } else if (state.label === "starting") {
      return <button disabled={true}>start</button>;
    } else if (state.label === "started") {
      return (
        <div>
          <StartedView data={state.data} />
          <button onClick={onStop}>stop</button>
        </div>
      );
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
      <MyButton />
    </div>
  );
}

// Render your React component instead
const root = createRoot((document as any).getElementById("app"));

root.render(<App />);
