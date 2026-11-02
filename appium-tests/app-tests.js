/**
 * SecureWay Appium E2E Automation Runner Entry Point
 */
import runTestSuite, { APPIUM_CONFIG, generateTestSuiteCatalog, generateExcelReport } from "./tests/app-tests.js";

runTestSuite().catch((err) => {
  console.error("Appium E2E Test execution failed:", err);
  process.exit(1);
});

export {
  runTestSuite,
  APPIUM_CONFIG,
  generateTestSuiteCatalog,
  generateExcelReport,
};
export default runTestSuite;
