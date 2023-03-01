import pkg from "./package.json";
import babel from "rollup-plugin-babel";
import resolve from "@rollup/plugin-node-resolve";
import external from "rollup-plugin-peer-deps-external";
import postcss from "rollup-plugin-postcss";
import replace from "@rollup/plugin-replace";
import commonjs from "@rollup/plugin-commonjs";
import analyze from "rollup-plugin-analyzer";
import { terser } from "rollup-plugin-terser";

export default {
	input: "./src/index.js",
	output: [
		//{ file: pkg.main, format: "cjs", sourcemap: true },
		{
			file: "dist/index.es.js",
			format: "es",
			//exports: "auto",
		},
	],
	plugins: [
		postcss({ plugins: [], minimize: true }),
		babel({
			exclude: "node_modules/**",
			presets: ["@babel/preset-react"],
		}),
		external(),
		replace({
			"process.env.NODE_ENV": JSON.stringify("development"),
			preventAssignment: true,
		}),
		resolve(),
		commonjs(),
		terser(),
		analyze({ summaryOnly: true, hideDeps: true }),
	],
};
