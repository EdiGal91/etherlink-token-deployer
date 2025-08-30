// contracts/scripts/renameArtifacts.ts
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function p(...segs: string[]) {
  return path.resolve(__dirname, "..", ...segs);
}

function renameIfExists(src: string, dst: string) {
  if (!fs.existsSync(src)) {
    console.log("[skip] no file:", src);
    return;
  }
  // if already renamed — skip
  if (fs.existsSync(dst)) {
    console.log("[skip] already exists:", dst);
    return;
  }
  fs.renameSync(src, dst);
  console.log("[ok] renamed:", path.basename(src), "→", path.basename(dst));
}

renameIfExists(
  p(
    "ignition/deployments/chain-42793/artifacts",
    "ERC20FactoryModule#ERC20Factory.json"
  ),
  p(
    "ignition/deployments/chain-42793/artifacts",
    "ERC20FactoryModule_ERC20Factory.json"
  )
);

renameIfExists(
  p(
    "ignition/deployments/chain-128123/artifacts",
    "ERC20FactoryModule#ERC20Factory.json"
  ),
  p(
    "ignition/deployments/chain-128123/artifacts",
    "ERC20FactoryModule_ERC20Factory.json"
  )
);

console.log("Artifacts rename done.");
