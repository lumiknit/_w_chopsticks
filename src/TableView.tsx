import { Component, For, Show } from "solid-js";
import { Game } from "./game";

const TableView: Component = () => {
  const game = new Game(5);
  const table = game.table();

  const formatHand = (hand: number) => {
    const l = hand % game.maxCount;
    const r = Math.floor(hand / game.maxCount);
    return `(${l},${r})`;
  };

  return (
    <table>
      <thead>
        <tr>
          <th>I / Op.</th>
          <For each={[...Array(game.maxCount * game.maxCount).keys()]}>
            {(i) => <th>{formatHand(i)}</th>}
          </For>
        </tr>
      </thead>
      <tbody>
        <For each={[...Array(game.maxCount * game.maxCount).keys()]}>
          {(i) => (
            <tr>
              <td>{formatHand(i)}</td>
              <For each={[...Array(game.maxCount * game.maxCount).keys()]}>
                {(y) => (
                  <td>
                    <Show when={table[i + y * game.maxCount ** 2]}>
                      <b
                        title={String(
                          table[i + y * game.maxCount ** 2]!.nextMove,
                        )}
                      >
                        {table[i + y * game.maxCount ** 2]!.win
                          ? "Win"
                          : "Lose"}
                        ({table[i + y * game.maxCount ** 2]!.depth})
                      </b>
                    </Show>
                  </td>
                )}
              </For>
            </tr>
          )}
        </For>
      </tbody>
    </table>
  );
};

export default TableView;
