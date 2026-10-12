---
description: type-check / テスト / lint をまとめて実行して、落ちたものだけ直す
allowed-tools: Bash(bun run type-check), Bash(bun test:unit --run), Bash(bun lint), Bash(bun format), Read, Edit, Grep, Glob
---

以下を順に実行して、プロジェクトが通る状態か確認してください。

1. `bun run type-check`
2. `bun test:unit --run`
3. `bun lint`

結果の報告ルール:

- 全部通ったら、一行で「通った」と報告して終わり。余計な要約はしない。
- 落ちたものがあれば、**エラー出力をそのまま貼ってから**原因を説明し、修正してください。修正後は落ちたコマンドだけ再実行する。
- テストが落ちている場合、テストを消す・skip する・期待値を実装に合わせて書き換える、で通すのは禁止。実装側のバグかテスト側の誤りかを判断して報告する。判断がつかないときは直さずに聞いてください。
- lint の `--fix` で自動修正された内容は、何が変わったか一行で触れる。
