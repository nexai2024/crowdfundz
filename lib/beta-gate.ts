// Read once when the server process loads this module. Flip BETA_GATE and restart;
// no code change is required.
const betaGate = process.env["BETA_GATE"];

export function betaWaitlistEnabled() {
  return betaGate === "enabled";
}
