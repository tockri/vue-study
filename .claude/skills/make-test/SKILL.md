---
name: make-test
description: |
  Use When: TypeScript単体テストを作ったり編集したりレビューするとき。
  単体テストのコーディングガイドを記述している。
---

# 単体テストのコーディングガイド

## description()で分割する。AAAパターン。

例：
```typescript
description('MyModule', () => { // モジュール単位
  description('doSomething', () => { // メソッド単位
    const {doSomething} = MyModule

    test('引数がnullのときにnullを返す', () => {
      // Arrange
      モック、スタブが必要ならここで準備

      // Act
      const result = doSomething(null)

      // Assert
      expect(result).toBe(null)
    })
  })
})
```

## 
