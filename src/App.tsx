import "@picocss/pico/css/pico.min.css";

import { Toaster } from "solid-toast";
import { createSignal, Show } from "solid-js";
import GameView from "./GameView";
import TableView from "./TableView";

function App() {
  const [showTable, setShowTable] = createSignal(false);

  return (
    <>
      <Toaster />
      <main class="container">
        <h1> Chopstick Game </h1>

        <a href="https://github.com/lumiknit/_w_chopsticks">
         🔗 Github (Description)
        </a>

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
