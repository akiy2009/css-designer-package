import postcss from "postcss";
import {
  autoContrast,
  adjustHue,
  adjustLightness,
  adjustSaturation
} from "./color-utils.js";

export default () => {
  return {
    postcssPlugin: "auto-design-tokens-optimizer",

    Declaration(decl) {
      const value = decl.value;

      if (!value.startsWith("#")) return;

      const originalColor = value;

      // ① コントラスト補正
      const textColor = autoContrast(originalColor);

      // ② 色相・明度・彩度を微調整
      const hueAdjusted = adjustHue(originalColor, 12);
      const lightAdjusted = adjustLightness(hueAdjusted, 0.03);
      const finalColor = adjustSaturation(lightAdjusted, 0.05);

      // ③ 自動補正した色を書き換え
      decl.cloneBefore({
        prop: decl.prop,
        value: finalColor
      });

      // ④ テキストカラーも補完
      decl.cloneAfter({
        prop: "color",
        value: textColor
      });

      // 元を削除
      decl.remove();
    }
  };
};

export const postcss = true;