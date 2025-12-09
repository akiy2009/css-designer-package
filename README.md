# Auto Design Tokens Optimizer  
_デザイントークン自動最適化ツール_  
**パッケージ名:** `@gakuseibot/auto-design-tokens-optimizer`

---

## ✨ 概要

**Auto Design Tokens Optimizer** は、デザイントークンを自動で最適化し、  
背景色に合わせたコントラスト調整・色相/明度/彩度の微調整により、  
一貫性がありアクセシブルな UI カラーを生成する軽量ツールです。

以下のユースケースに最適です：

- デザインシステムの色を自動で WCAG 対応させたい  
- CSS 変数（`--color-primary` など）をバラつきなく整えたい  
- JSON トークンを自動で正規化 → 最適化したい  
- PostCSS と組み合わせてビルド時に自動修正したい

CLI と PostCSS プラグインのどちらでも利用できます。

---

## 🚀 特徴

- 🎨 **背景色に合わせた自動コントラスト調整（WCAG AA / AAA 対応）**
- 🔧 **色相・明度・彩度（HSL）のバランス補正**
- 🏷️ JSON / CSS トークンを自動で正規化
- 🗂️ CSS 変数・JSON の両方にフル対応
- ⚡ 使いやすい CLI ツール  
- 🧩 PostCSS プラグインとしても動作
- 📦 ランタイム依存ほぼゼロの軽量設計

---

## 📦 インストール

npm からインストール：

```sh
npm install @gakuseibot/auto-design-tokens-optimizer
```
npx で即実行：

```sh
npx adt-optimize --help
```

## 🛠 使い方（CLI）
🔹 基本
```sh
adt-optimize --input tokens.json --output tokens.fixed.json
```

🔹 CSS 変数の場合
```sh
adt-optimize --input styles.css --output styles.fixed.css --format css
```

## ⚙ オプション一覧
| オプション                  | 説明                 |                |
| ---------------------- | ------------------ | -------------- |
| `--input <file>`       | 入力ファイル（CSS / JSON） |                |
| `--output <file>`      | 出力先ファイル            |                |
| `--format css          | json`              | 出力形式を強制指定      |
| `--target-contrast 4.5 | 7.0`               | WCAG の目標コントラスト |
| `--preset wcag-aa      | wcag-aaa`          | アクセシビリティプリセット  |
| `--colors-only`        | カラー系トークンのみ処理       |                |
| `--dry-run`            | 出力ファイルを作らず標準出力へ    |                |

## PostCSS プラグインとして使用

postcss.config.js に追加：
```sh
module.exports = {
  plugins: [
    require("@gakuseibot/auto-design-tokens-optimizer/postcss")({
      targetContrast: 4.5,
      adjustHue: true,
      adjustSaturation: true
    })
  ]
};
```
## 🗂 JSON トークン例
入力: tokens.json
```sh
{
  "primary": "#4c8cff",
  "background": "#ffffff",
  "success": "#28c76f"
}
```

出力: tokens.fixed.json
```sh
{
  "primary": "#2d6fe8",
  "background": "#ffffff",
  "success": "#219c58"
}
```
※ 値は例示であり正確ではありません。

## 📁 プロジェクト構成
```sh
src/
  color.ts
  tokens.ts
  optimizer.ts
  cli-core.ts
  postcss-plugin.ts
  utils.ts
bin/
  adt-optimize.js
```
## 📄 ライセンス
このプロジェクトは Apache License 2.0 の下で公開されています。

## 📬 連絡先
改善案・バグ報告・Pull Request などはお気軽にどうぞ。
Email: akiy2009_dev@outlook.jp
Discord: @aki._.yama

## ⭐ サポート
良いと思ったら GitHub リポジトリにスターをお願いします！
開発継続の大きな励みになります。
