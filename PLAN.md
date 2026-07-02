# 中国象棋网页版 - 实现计划

## 1. 技术栈

### 前端
- **Vue 3** (Composition API + `<script setup>`)
- **Vite** 构建工具
- **Pinia** 状态管理
- **CSS3** 棋盘和棋子样式（纯 CSS，无第三方 UI 库）

### 后端
- **Node.js** (>=18)
- **ws** (WebSocket 库，轻量级)
- **Express** (仅用于静态文件托管和健康检查)

### 通信
- **WebSocket** 实时双向通信

---

## 2. 项目结构

```
chess/
├── package.json              # 前端依赖
├── vite.config.js
├── index.html
├── public/
│   └── favicon.ico
├── src/
│   ├── main.js
│   ├── App.vue
│   ├── router/
│   │   └── index.js          # Vue Router
│   ├── stores/
│   │   ├── lobby.js          # 大厅状态 (当前用户、桌子列表)
│   │   └── game.js           # 对局状态 (棋盘、走棋、悔棋)
│   ├── views/
│   │   ├── LobbyView.vue     # 大厅页面
│   │   └── GameView.vue      # 对局页面
│   ├── components/
│   │   ├── TableCard.vue     # 单张桌子卡片 (座位状态)
│   │   ├── ChessBoard.vue    # 棋盘组件
│   │   ├── ChessPiece.vue    # 单个棋子
│   │   └── GameResult.vue    # 胜负弹窗
│   ├── game/
│   │   ├── constants.js      # 棋子常量、初始布局
│   │   ├── rules.js          # 各棋子走法规则 (核心)
│   │   ├── board.js          # 棋盘操作 (移动、吃子、检测)
│   │   └── notation.js       # 棋谱记录 (可选)
│   ├── ws/
│   │   ├── client.js         # WebSocket 客户端封装
│   │   └── protocol.js       # 消息协议定义
│   └── assets/
│       └── style.css         # 全局样式
└── server/
    ├── package.json          # 后端依赖
    ├── index.js              # 服务入口 (Express + ws)
    ├── rooms.js              # 房间/桌子管理
    ├── gameState.js          # 服务端棋盘状态 + 规则校验
    └── protocol.js           # 消息协议 (与前端共享)
```

---

## 3. 消息协议 (WebSocket JSON)

### 客户端 → 服务端

| type | payload | 说明 |
|------|---------|------|
| `lobby.join` | `{ playerName }` | 进入大厅，分配 userId |
| `table.sit` | `{ tableId, seatIndex }` | 坐下 (seat: 0=红方/下方, 1=黑方/上方) |
| `table.leave` | `{ tableId }` | 离开座位 |
| `game.move` | `{ from: [r,c], to: [r,c] }` | 走棋 |
| `game.undo` | `{ tableId }` | 请求悔棋 |
| `game.undo.respond` | `{ accept: boolean }` | 同意/拒绝悔棋 |

### 服务端 → 客户端

| type | payload | 说明 |
|------|---------|------|
| `lobby.state` | `{ tables: [...] }` | 大厅全量状态 |
| `lobby.update` | `{ tableId, seatIndex, player?, action }` | 增量更新 (坐下/离开) |
| `game.start` | `{ board, yourColor, opponentName, tableId }` | 对局开始 |
| `game.moved` | `{ from, to, board, captured? }` | 走棋结果广播 |
| `game.undo.request` | `{ fromPlayer }` | 悔棋请求 (给对手) |
| `game.undo.result` | `{ board, undoneBy }` | 悔棋结果广播 |
| `game.over` | `{ winner, reason }` | 游戏结束 |
| `error` | `{ message }` | 错误提示 |

---

## 4. 棋盘表示与规则实现

### 4.1 棋盘数据结构

```
board: 10行 × 9列 二维数组
每个格子: null 或 { type, color }
```

棋子类型 (type):
- `K` (将/帅), `A` (士/仕), `B` (象/相), `N` (马), `R` (车), `C` (炮), `P` (兵/卒)

颜色 (color): `red` | `black`

### 4.2 初始布局

```
行0 (黑方底线): R N B A K A B N R
行1: 空
行2: . C . . . . . C .    (炮在 col=1,7)
行3: P . P . P . P . P    (兵在 col=0,2,4,6,8)
行4: 空
行5: 空
行6: P . P . P . P . P    (兵在 col=0,2,4,6,8)
行7: . C . . . . . C .    (炮在 col=1,7)
行8: 空
行9 (红方底线): R N B A K A B N R
```

### 4.3 各棋子走法规则 (`rules.js`)

| 棋子 | 走法 |
|------|------|
| **将/帅 (K)** | 横/竖各一步，不出九宫 (red: r=7-9,c=3-5; black: r=0-2,c=3-5)；**对面笑规则**：两个将不能在同一直线且中间无子 |
| **士/仕 (A)** | 斜走一步，不出九宫 |
| **象/相 (B)** | 走"田"字对角，不能过河 (red: r=5-9; black: r=0-4)，**塞象眼**：田字中心有子不能走 |
| **马 (N)** | 走"日"字 (先直一步再斜一步)，**蹩马腿**：直行方向有子不能走 |
| **车 (R)** | 横/竖直线任意步，不能越子 |
| **炮 (C)** | 移动同车 (直线不越子)；吃子必须翻山 (隔一个子才能吃) |
| **兵/卒 (P)** | 未过河只能前进一步；过河后可前/左/右各一步，不能后退 |

### 4.4 走棋校验流程 (`gameState.js` — 服务端权威)

```
1. 格子合法性检查 (在棋盘范围内)
2. 不能吃己方棋子
3. 棋子类型走法校验
4. 走棋后不能让己方将/帅被将军 (自杀检测)
5. 走棋后检测是否将军对方
```

### 4.5 胜负判定

- 吃掉对方 `K` (将/帅) → 立即获胜
- 检测是否形成 **将死** (checkmate) → 可扩展，但基础版只需检测吃将

---

## 5. 棋盘渲染 (ChessBoard.vue)

### 布局
- CSS Grid: 10行 × 9列
- 每个格子 60px × 60px
- 棋盘线条用 CSS 绘制 (border + 伪元素画对角线)
- 楚河汉界在第4-5行之间，用文字标注

### 棋子
- 圆形 div，内含中文字符
- 红方: `红色边框 + 白底`，文字: 帅、仕、相、马、车、炮、兵
- 黑方: `黑色边框 + 白底`，文字: 将、士、象、马、车、炮、卒
- 可选走位高亮 (选中棋子后显示合法目标格)

### 交互流程
1. 点击己方棋子 → 选中，高亮合法走位
2. 点击合法目标格 → 发送 `game.move`
3. 点击非法目标格 / 点击空白 → 取消选中
4. 服务端返回 `game.moved` → 更新棋盘

---

## 6. 大厅与桌子管理

### 6.1 LobbyView.vue
- 页面加载 → 连接 WebSocket → 发送 `lobby.join`
- 显示桌子列表 (Grid 布局，每张桌子一个 TableCard)
- 每张桌子显示: 桌号、红方座位 (玩家名或"空位")、黑方座位

### 6.2 TableCard.vue
- Props: `tableId`, `seats[2]`, `isPlaying`
- 点击空位 → 发送 `table.sit`
- 已坐下可点"离开"
- 满员且非本桌 → 显示"游戏中"

### 6.3 服务端桌子管理 (`rooms.js`)
- 维护 `Map<tableId, { seats: [userId|null, userId|null], gameState? }>`
- 固定数量桌子 (默认5张)，初始全空
- 坐下时检查座位是否为空
- 两人坐下后自动创建 gameState 并通知双方开始

---

## 7. 游戏状态管理 (Pinia)

### stores/game.js

```js
state: {
  tableId: null,
  board: null,           // 10x9 二维数组
  myColor: 'red' | 'black',
  opponentName: '',
  selectedPiece: null,   // [row, col]
  validMoves: [],        // [[row, col], ...]
  turn: 'red',           // 当前轮到谁
  gameOver: false,
  winner: null,
  lastMove: null,        // { from, to }
  pendingUndo: false,    // 是否有待处理的悔棋请求
}

actions:
  selectPiece(row, col)      → 计算合法走位并高亮
  movePiece(from, to)        → 发送 WebSocket 消息
  applyMove(from, to, board) → 本地更新棋盘
  requestUndo()              → 发送悔棋请求
  respondUndo(accept)        → 响应悔棋
  reset()                    → 清空状态
```

### stores/lobby.js

```js
state: {
  userId: null,
  playerName: '',
  tables: [],              // [{ id, seats: [{player}, {player}], isPlaying }]
  myTableId: null,
  mySeat: null,
}

actions:
  join(name)               → WebSocket 连接 + lobby.join
  sit(tableId, seatIndex)  → 发送 table.sit
  leave()                  → 发送 table.leave
```

---

## 8. WebSocket 客户端封装 (`ws/client.js`)

```js
class WsClient {
  constructor(url)
  connect()                 → 建立连接
  send(type, payload)      → JSON 序列化发送
  on(type, callback)       → 注册消息处理器
  close()                  → 断开连接
}

// 自动重连机制 (3秒间隔)
// 心跳检测 (30秒 ping/pong)
```

---

## 9. 服务端架构 (`server/`)

### index.js
- Express 托管前端构建产物 (`dist/`)
- WebSocket 挂载到 HTTP server
- 连接管理: `Map<ws, { userId, playerName, tableId? }>`

### gameState.js (服务端权威)

```js
class GameState {
  constructor(playerRed, playerBlack)
  board                    // 10x9 初始棋盘
  currentTurn              // 'red' | 'black'
  moveHistory              // [{ from, to, captured }]
  
  makeMove(userId, from, to)  // 校验 + 执行
  requestUndo(userId)         // 返回 true/false
  applyUndo()                 // 撤销最后一步
  isInCheck(color)            // 检测是否被将军
  isCheckmate(color)          // 检测是否将死 (可选)
}
```

**关键: 所有规则校验在服务端完成，客户端仅做UI展示。**

---

## 10. 悔棋流程

```
玩家A点击悔棋 → 发送 game.undo
服务端检查: A是否是最后走棋的人? 当前是否在A的回合? → 否则拒绝
服务端转发 game.undo.request 给玩家B
玩家B看到弹窗 → 同意/拒绝
  - 同意: 服务端撤销最后一步，广播 game.undo.result
  - 拒绝: 服务端通知A悔棋被拒
```

**限制: 只能在对方走棋前悔棋 (即自己刚走完，对方还没走时)。**

---

## 11. 实现步骤 (建议顺序)

### Phase 1: 基础骨架 (Day 1)
1. [x] 初始化 Vite + Vue 3 项目
2. [ ] 搭建 Express + ws 后端 (`server/`)
3. [ ] 定义消息协议 (`protocol.js`，前后端共享)
4. [ ] 实现 WebSocket 客户端封装

### Phase 2: 大厅功能 (Day 1-2)
5. [ ] 实现服务端桌子管理 (`rooms.js`)
6. [ ] 实现 LobbyView + TableCard 组件
7. [ ] 实现大厅 WebSocket 通信
8. [ ] 坐下/离开/满员自动开始

### Phase 3: 棋盘与规则 (Day 2-3)
9. [ ] 实现棋子常量和初始布局 (`constants.js`)
10. [ ] 实现所有棋子走法规则 (`rules.js`)
11. [ ] 实现棋盘操作 (移动、吃子、将军检测) (`board.js`)
12. [ ] 实现服务端 GameState (`gameState.js`)

### Phase 4: 对局功能 (Day 3-4)
13. [ ] 实现 ChessBoard + ChessPiece 组件
14. [ ] 实现走棋交互 (选中→高亮→移动)
15. [ ] 实现对局 WebSocket 通信
16. [ ] 棋盘渲染 (10×9 网格、楚河汉界、棋子样式)

### Phase 5: 高级功能 (Day 4-5)
17. [ ] 实现悔棋流程
18. [ ] 实现胜负判定和弹窗
19. [ ] 实现将死检测 (可选)
20. [ ] 实现自动重连

### Phase 6: 打磨 (Day 5)
21. [ ] 样式美化
22. [ ] 音效 (可选)
23. [ ] 响应式适配

---

## 12. 关键设计决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 服务端权威 | 所有规则校验在服务端 | 防作弊 |
| 棋盘方向 | 各方视角: 己方在下 | 需要根据颜色翻转棋盘坐标显示 |
| 悔棋方式 | 对手同意制 | 符合需求"对方移动前可悔棋" |
| 状态同步 | 全量同步 (每步返回完整 board) | 简单可靠，棋盘数据量小 |
| 棋子渲染 | CSS + 中文字符 | 无需图片资源，简洁美观 |

---

## 13. 坐标映射 (重要)

棋盘数据: `[row][col]`, row 0=顶 (黑方底线), row 9=底 (红方底线)

- **红方视角 (myColor=red)**: row 9 在屏幕下方，row 0 在上方 (默认不翻转)
- **黑方视角 (myColor=black)**: 需要 180° 翻转显示 — 屏幕下方显示 row 0，上方显示 row 9

渲染时: `displayRow = myColor === 'red' ? row : (9 - row)`
