# Chopsticks Game Simulator

Play chopsticks game with the computer.
젓가락 게임 시뮬레이터

https://lumiknit.github.io/apps/chopsticks/

## Purpose

- 젓가락 게임에서 선공필승 / 후공필승 여부가 알고 싶었음.
  - `(1,1) - (1,1)` 시작 기준으로는 후공 필승인 듯 함..
	- `(4,0) - (3,1)`, `(3,1) - (2,2)` 등의 상황에서는 사이클 있는 듯?

## How to?

- 웹페이지에서 게임 진행 가능
  - Left to Right 면 왼손으로 오른손 치기
	- Left to 3 이면 왼쪽을 3으로 (오른쪽에 나머지)
- CPU 선공을 원하면 CPU First

## Build

```bash
pnpm install
pnpm dev
```
