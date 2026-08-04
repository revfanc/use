import pluginVue from "eslint-plugin-vue";
import {
  vueTsConfigs,
  withVueTs,
} from "@vue/eslint-config-typescript";

export default withVueTs(
  {
    ignores: ["**/dist/**", "coverage/**"],
  },
  pluginVue.configs["flat/essential"],
  vueTsConfigs.recommended,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "vue/multi-word-component-names": "off",
    },
  },
  {
    files: ["**/*.d.ts"],
    rules: {
      "@typescript-eslint/no-empty-object-type": "off",
    },
  }
);
