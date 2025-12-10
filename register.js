import { register } from "module";
import { pathToFileURL } from "url";

register("./tsconfig-paths-loader.js", pathToFileURL("./"));