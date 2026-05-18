import { initDriver, closeDriver, navigateTo } from "./setup";
import { verifyControlBarElements } from "./cucumber.utils.js";
import "./step-definitions/controlBar.steps";

export async function runControlBarTests(): Promise<void> {
  // Initialize Selenium driver
  await initDriver();

  try {
    console.log("\n=== Starting Control Bar Tests ===");
    console.log("Current working directory:", process.cwd());
    console.log(
      "App URL:",
      process.env.REACT_APP_URL || "http://localhost:3000/",
    );

    // Navigate to the application
    const appUrl = process.env.REACT_APP_URL || "http://localhost:3000/";
    await navigateTo(appUrl);

    // Wait for initial load
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Verify control bar elements are present
    console.log("\nVerifying control bar elements...");
    await verifyControlBarElements();
    console.log("\n✓ All control bar elements found!");

    // You can add specific test runs here if you want to execute only certain features
    // For now, we just verify the elements are there

    console.log("\n=== Control Bar Tests Completed Successfully ===\n");
  } catch (error) {
    console.error("\n✗ Test execution failed:", error);
    throw error;
  } finally {
    await closeDriver();
    console.log("Selenium driver closed");
  }
}

export default runControlBarTests;
