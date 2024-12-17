import { Component, createSignal, Show } from "solid-js";
import { Game, GameState, Move } from "./game";
import toast from "solid-toast";

type Props = {};

type History = {
  turn: "cpu" | "human";
  prev: GameState;
  next: GameState;
  move: Move;
};

const aTimeout = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const historyToString = (history: History) => {
  const player = history.turn === "cpu" ? "CPU" : "Human";
  const op = history.turn === "cpu" ? "Human" : "CPU";

  if (typeof history.move === "number") {
    return `${player} re-split (${history.prev[0]}, ${history.prev[1]}) to (${history.next[2]}, ${history.next[3]})! (${op}: (${history.next[0]}, ${history.next[1]}))`;
  } else if (history.move === "end") {
    return `${player} GG!`;
  } else {
    // Split
    const [src, dst] = history.move.split("-");
    const [si, di] = [src, dst].map((i) => (i === "left" ? 0 : 1));
    return `${player} hit ${dst}(${history.prev[2 + di]}->${history.next[di]}) side by ${src}(${history.prev[si]})!`;
  }
};

const GameView: Component<Props> = () => {
  const game = new Game(5);
  const table = game.table();
  const [humanTurn, setHumanTurn] = createSignal(true);
  const [state, setState] = createSignal<GameState>([1, 1, 1, 1]);

  const [history, setHistory] = createSignal<History[]>([]);

  const reset = () => {
    setState([1, 1, 1, 1]);
    setHistory([]);
    setHumanTurn(true);
  };

  const moveIsAvailable = (move: Move) => {
    const next = game.action(game.stateToIndex(state()), move);
    return next !== undefined;
  };

  const cpuTurn = (next: number) => {
    // CPU-turn
    const cpuMove = game.findBest(table, next);
    const cpuNext = game.action(next, cpuMove);
    if (cpuNext === undefined) {
      toast.error("Invalid move");
      return;
    }
    setState(game.indexToState(cpuNext));
    const cpuHistory: History = {
      turn: "cpu",
      prev: game.indexToState(next),
      next: game.indexToState(cpuNext),
      move: cpuMove,
    };
    setHistory((h) => [...h, cpuHistory]);
    setHumanTurn(true);
    toast(historyToString(cpuHistory));
  };

  const handleAction = async (action: Move) => {
    const prev = state();
    const next = game.action(game.stateToIndex(prev), action);
    if (next === undefined) {
      toast.error("Invalid move");
      return;
    }
    setState(game.indexToState(game.passTurn(next)));
    const humanHistory: History = {
      turn: "human",
      prev,
      next: game.indexToState(next),
      move: action,
    };
    setHistory((h) => [...h, humanHistory]);
    setHumanTurn(false);
    toast(historyToString(humanHistory));

    await aTimeout(1000);

    cpuTurn(next);
  };

  const cpuFirst = async () => {
    toast("CPU First");
    const next = game.passTurn(game.stateToIndex(state()));
    cpuTurn(next);
  };

  return (
    <div>
      <div class="board">
        <h2>
          CPU Player
          <Show when={!humanTurn()}>
            <span> * </span>
          </Show>
        </h2>
        <div class="half">
          <div>
            Left: <code>{state()[2]}</code>
          </div>
          <div>
            Right: <code>{state()[3]}</code>
          </div>
        </div>
      </div>

      <div class="board">
        <h2>
          Human Player
          <Show when={humanTurn()}>
            <span> * </span>
          </Show>
        </h2>
        <div class="half">
          <div>
            Left: <code>{state()[0]}</code>
          </div>
          <div>
            Right: <code>{state()[1]}</code>
          </div>
        </div>
      </div>

      <div>
        <h3> Action </h3>
        <div>
          <button
            disabled={!humanTurn() || !moveIsAvailable("left-left")}
            onClick={() => handleAction("left-left")}
          >
            Left to Left
          </button>
          <button
            disabled={!humanTurn() || !moveIsAvailable("left-right")}
            onClick={() => handleAction("left-right")}
          >
            Left to Right
          </button>
          <button
            disabled={!humanTurn() || !moveIsAvailable("right-left")}
            onClick={() => handleAction("right-left")}
          >
            Right to Left
          </button>
          <button
            disabled={!humanTurn() || !moveIsAvailable("right-right")}
            onClick={() => handleAction("right-right")}
          >
            Right to Right
          </button>
        </div>
        <div>
          {[...Array(game.maxCount).keys()].map((i) => (
            <button
              class="secondary"
              disabled={!humanTurn() || !moveIsAvailable(i)}
              onClick={() => handleAction(i)}
            >
              Left to {i}
            </button>
          ))}
        </div>

        <br />
        <Show when={history().length === 0}>
          <button onClick={() => cpuFirst()}>CPU First</button>
        </Show>
      </div>

      <div>
        <h2> History </h2>
        <ol>
          {history().map(s => (
            <li>{historyToString(s)}</li>
          ))}
        </ol>
      </div>

      <div>
        <button class="outline" onClick={reset}>
          Reset
        </button>
      </div>

      <hr />
    </div>
  );
};

export default GameView;
