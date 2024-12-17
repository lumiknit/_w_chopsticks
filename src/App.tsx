import "@picocss/pico/css/pico.min.css";

import { Toaster } from "solid-toast";
import { Game } from "./game";
import { createSignal, For, Show } from "solid-js";
import GameView from "./GameView";
import TableView from "./TableView";

function App() {
  const [showTable, setShowTable] = createSignal(false);

  return (
    <>
      <Toaster />
      <main class="container">
        <GameView />

        <h1> All Possible Cases </h1>
        <button onClick={() => setShowTable(!showTable())}>
          {showTable() ? "Hide" : "Show"}
        </button>
        <Show when={showTable()}>
          <TableView />
        </Show>
      </main>
    </>
  );
}

export default App;
