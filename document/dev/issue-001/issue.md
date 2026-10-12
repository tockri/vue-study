# マスター管理画面を作る

Vueコンポーネントをどう分割するべきかを勉強会で解説するためのサンプルアプリケーションを作る

## 地公体マスター管理画面

教材。 `/local-government/master-editor/` 以下のファイル群。`Group`データの一般的なCRUD画面。

`\src\local-government\master-editor\types.ts` に、使用する型とAPIの定義を書いてある。

今回はサンプルなので、`GroupCheckService`は適当なスタブオブジェクトを用意して使う。

## 画面構成

ブラウザで`/local-government/master-editor/`を開くと「地公体グループ」の一覧を`<v-data-table>`で表示している。

### 一覧画面を構成する要素

名前は、変数名、コンポーネント名、コンポーネントのidまたはtest-id、classなどに使うための名前。

| 名前 | 説明 |
| -- | -- |
| listTable | `Group`の一覧を`<v-data-table>`で表示する |
| createButton | listTableの左上に表示。クリックするとcreateDialogを開く |
| createDialog | 新規登録ダイアログ。`<v-dialog>`で一覧画面にかぶせて表示する。 |
| createForm | createDialogの中身フォーム。`CreateGroupPayload`を生成する。 |
| editButton | listTableの「グループID」列は見た目ハイパーリンクっぽい`<v-btn>`で、クリックするとeditDialogを開く |
| editDialog | グループ編集ダイアログ。`<v-dialog>`で一覧画面に被せて表示する。左下にはconfirmDeleteButtonを表示 |
| editForm | editDialogの中身フォーム。`EditGroupPayload`を生成する。 |
| confirmDeleteButton | 「削除」というラベルだが、クリックするとeditDialogにさらに被せてconfirmDeleteDialogを開く |
| confirmDeleteDialog | 「グループ（グループID）を削除してよろしいですか？」という確認メッセージを表示する |