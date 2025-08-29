import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("ERC20FactoryModule", (m) => {
  const counter = m.contract("ERC20Factory");

  return { counter };
});
