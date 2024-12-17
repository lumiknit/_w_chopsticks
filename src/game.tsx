export type Move =
  | "end" // End of game
  | "left-left" // hit left side by left
  | "left-right" // hit left side by right
  | "right-left" // hit right side by left
  | "right-right" // hit right side by right
  | number; // Split. Number represents the number of left hand.

type GameCell = {
  win: boolean;
  nextMove: Move;
  depth: number;
};

type GameTable = (GameCell | undefined)[];

export type GameState = [number, number, number, number];

export class Game {
  maxCount: number;
  allMoves: Move[];

  constructor(maxCount: number) {
    this.maxCount = maxCount;
    this.allMoves = ["left-left", "left-right", "right-left", "right-right"];
    for (let i = 0; i < maxCount; i++) {
      this.allMoves.push(i);
    }
  }

  /** State to index */
  stateToIndex([l1, r1, l2, r2]: GameState): number {
    return (
      l1 + this.maxCount * (r1 + this.maxCount * (l2 + this.maxCount * r2))
    );
  }

  /** Index to state */
  indexToState(index: number): GameState {
    const l1 = index % this.maxCount;
    index = Math.floor(index / this.maxCount);
    const r1 = index % this.maxCount;
    index = Math.floor(index / this.maxCount);
    const l2 = index % this.maxCount;
    index = Math.floor(index / this.maxCount);
    const r2 = index % this.maxCount;
    return [l1, r1, l2, r2];
  }

  passTurn(state: number): number {
    const [l1, r1, l2, r2] = this.indexToState(state);
    return this.stateToIndex([l2, r2, l1, r1]);
  }

  /**
   * Perform action on the state.
   * If impossible, return undefined. */
  action(state: number, move: Move): number | undefined {
    let [l1, r1, l2, r2] = this.indexToState(state);
    if (typeof move === "number") {
      if (
        l1 === move ||
        r1 === move ||
        move < 0 ||
        move >= this.maxCount ||
        l1 + r1 - move >= this.maxCount ||
        l1 + r1 - move < 0
      ) {
        return undefined;
      }
      r1 = l1 + r1 - move;
      l1 = move;
    } else {
      switch (move) {
        case "left-left":
          if (l1 < 1 || l2 < 1) return undefined;
          l2 += l1;
          if (l2 >= this.maxCount) l2 = 0;
          break;
        case "left-right":
          if (l1 < 1 || r2 < 1) return undefined;
          r2 += l1;
          if (r2 >= this.maxCount) r2 = 0;
          break;
        case "right-left":
          if (r1 < 1 || l2 < 1) return undefined;
          l2 += r1;
          if (l2 >= this.maxCount) l2 = 0;
          break;
        case "right-right":
          if (r1 < 1 || r2 < 1) return undefined;
          r2 += r1;
          if (r2 >= this.maxCount) r2 = 0;
          break;
        default:
          return undefined;
      }
    }
    // Switch turn.
    return this.stateToIndex([l2, r2, l1, r1]);
  }

  fillTableCell(tbl: GameTable, state: number, debug?: boolean): boolean {
    if (debug) console.log("-- Traverse", this.indexToState(state));
    if (tbl[state] !== undefined) return false;
    let wins: Move[] = [];
    let unknowns: Move[] = [];
    let moveOptions: Move[] = [];
    for (const move of this.allMoves) {
      const next = this.action(state, move);
      if (next === undefined) continue;
      if (debug)
        console.log("Check move", move, this.indexToState(next), tbl[next]);
      moveOptions.push(move);
      if (tbl[next] === undefined) {
        unknowns.push(move);
      } else if (tbl[next].win === false) {
        wins.push(move);
        break;
      }
    }
    if (wins.length > 0) {
      // Find min depth
      let i = 0;
      for (let j = 1; j < wins.length; j++) {
        if (
          tbl[this.action(state, wins[j])!]!.depth <
          tbl[this.action(state, wins[i])!]!.depth
        )
          i = j;
      }
      tbl[state] = {
        win: true,
        nextMove: wins[i],
        depth: tbl[this.action(state, wins[i])!]!.depth + 1,
      };
      return true;
    } else if (unknowns.length === 0) {
      let depth = 0;
      for (const move of moveOptions) {
        depth = Math.max(depth, tbl[this.action(state, move)!]!.depth);
      }
      tbl[state] = { win: false, nextMove: unknowns[0], depth: depth };
      return true;
    } else if (moveOptions.length === 1) {
      // Check the only move
      const move = moveOptions[0];
      const next = this.action(state, move);
      if (next === undefined) return false;
      if (tbl[next] === undefined) return false;
      tbl[state] = {
        win: !tbl[next].win,
        nextMove: move,
        depth: tbl[next].depth + 1,
      };
      return true;
    }
    return false;
  }

  /** Calculate all possible movement */
  table(): GameTable {
    const tbl: GameTable = Array(this.maxCount ** 4).fill(undefined);

    // First, fill end states
    // If I=(0, 0), Y=any, I losed
    for (let i = 0; i < this.maxCount; i++) {
      for (let y = 0; y < this.maxCount; y++) {
        tbl[this.stateToIndex([0, 0, i, y])] = {
          win: false,
          nextMove: "end",
          depth: 0,
        };
        tbl[this.stateToIndex([i, y, 0, 0])] = {
          win: true,
          nextMove: "end",
          depth: 0,
        };
      }
    }

    // Find unfilled cell and check there are force-win move.
    let changed: boolean = true;
    let cnt: number = 0;
    while (changed) {
      changed = false;
      cnt++;
      const max = this.maxCount ** 4;
      for (let i = 0; i < max; i++) {
        changed = this.fillTableCell(tbl, i) || changed;
      }
    }
    console.log("Finished in", cnt, "iterations");

    this.fillTableCell(tbl, this.stateToIndex([1, 1, 1, 1]), true);

    return tbl;
  }

  findBest(table: GameTable, state: number): Move {
    let allowed: Move[] = [];
    let wins: Move[] = [];
    let unknowns: Move[] = [];
    for (const move of this.allMoves) {
      const next = this.action(state, move);
      if (next === undefined) continue;
      allowed.push(move);
      console.log("Check", move, this.indexToState(next), table[next]);
      if (table[next] === undefined) {
        unknowns.push(move);
        continue;
      } else if (table[next].win === false) {
        wins.push(move);
      }
    }
    if (wins.length > 0) {
      // Find min depth
      let i = 0;
      for (let j = 1; j < wins.length; j++) {
        if (
          table[this.action(state, wins[j])!]!.depth <
          table[this.action(state, wins[i])!]!.depth
        )
          i = j;
      }
      return wins[i];
    }
    if (unknowns.length > 0)
      return unknowns[Math.floor(Math.random() * unknowns.length)];
	// Find max depth
	let i = 0;
	for (let j = 1; j < allowed.length; j++) {
		if (
			table[this.action(state, allowed[j])!]!.depth >
			table[this.action(state, allowed[i])!]!.depth
		)
			i = j;
	}
    return allowed[i];
  }
}
