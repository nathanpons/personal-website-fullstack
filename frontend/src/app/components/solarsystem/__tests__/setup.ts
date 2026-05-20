import { Builder, WebDriver } from "selenium-webdriver";

export let driverInstance: WebDriver;

// Initialize driver
export async function initDriver(): Promise<WebDriver> {
  if (!driverInstance) {
    driverInstance = await new Builder().forBrowser("chrome").build();
  }
  return driverInstance;
}

// Close driver
export async function closeDriver(): Promise<void> {
  if (driverInstance) {
    await driverInstance.quit();
    console.log("Driver closed successfully");
  }
}

// Navigate to app
export async function navigateTo(url: string): Promise<void> {
  if (!driverInstance) {
    initDriver();
  }
  if (driverInstance) {
    await driverInstance.get(url);
    await driverInstance.sleep(1000); // Wait for page to load
  }
}

// Get current URL
export async function getCurrentUrl(): Promise<string> {
  if (!driverInstance) {
    initDriver();
  }
  return await driverInstance.getCurrentUrl();
}

export async function getDriver(): Promise<WebDriver> {
  if (!driverInstance) {
    const driverInstance = await initDriver();
  }
  return driverInstance;
}

// Take screenshot and save to file
export { getScreenshotName, takeScreenshot } from "./cucumber.utils.js";
