import * as path from "path";

// Keep track of screenshot counter to make names unique
let screenshotCounter = 0;

export function getScreenshotName(
  prefix = "screenshot",
  subPath = "screenshots",
) {
  screenshotCounter++;
  const timestamp = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const uniqueName = `${prefix}-${timestamp}-${screenshotCounter}.png`;
  return uniqueName;
}

export async function takeScreenshot(name, subPath = "screenshots") {
  const screenshotPath = path.join(process.cwd(), name);

  try {
    await driver.saveScreenshot(screenshotPath);
    console.log(`Screenshot saved to: ${screenshotPath}`);
    return screenshotPath;
  } catch (error) {
    console.error("Error taking screenshot:", error);
    return "";
  }
}

export async function verifyControlBarElements() {
  const elements = [
    { selector: ".control-bar", name: "Control Bar Container" },
    { selector: ".control-bar-header", name: "Control Bar Header" },
    { selector: "#planet-select", name: "Planet Select Dropdown" },
    { selector: "#time-scale", name: "Time Scale Slider" },
    {
      selector: "#pause-simulation-checkbox",
      name: "Pause Simulation Checkbox",
    },
    { selector: "#show-orbits-checkbox", name: "Show Orbit Lines Checkbox" },
    { selector: ".toggle-button", name: "Toggle Button" },
  ];

  const missingElements = [];

  for (const { selector, name } of elements) {
    try {
      await driver.wait(
        async () => {
          const element = await driver.findElement(By.css(selector));
          const displayed = await element.isDisplayed();
          return displayed;
        },
        5000,
        `${name} did not appear`,
      );
    } catch (error) {
      missingElements.push({ selector, name });
    }
  }

  if (missingElements.length > 0) {
    throw new Error(
      `Missing control bar elements: ${missingElements.map((e) => e.name).join(", ")}`,
    );
  }
}

export async function waitForControlBarExpansion() {
  await driver.wait(
    async () => {
      try {
        const planetSelect = await driver.findElement(By.id("planet-select"));
        const isDisplayed = await planetSelect.isDisplayed();
        return isDisplayed;
      } catch {
        return false;
      }
    },
    5000,
    "Control bar expansion timed out",
  );
}

export async function clearSelectDropdown(selectId) {
  const select = await driver.findElement(By.id(selectId));
  await driver.executeScript(`
    const select = document.getElementById('${selectId}');
    const options = select.options;
    // Set first option as selected
    select.selectedIndex = 0;
    select.value = options[0].value;
    select.dispatchEvent(new Event('change', { bubbles: true }));
  `);
}

export async function typeInDropdown(selectId, options) {
  const select = await driver.findElement(By.id(selectId));
  const optionsCount = options.length;

  // Click on the select dropdown
  await select.click();
  await driver.sleep(100);

  // Check which option is selected
  const currentValue = await select.getAttribute("value");

  // If value is empty, we're on Free View
  if (!currentValue) {
    return "";
  }

  // Get the selected index
  const selectedIndex = parseInt(currentValue) || 0;

  // Verify which option is currently selected
  if (selectedIndex < optionsCount) {
    return options[selectedIndex].name;
  }

  // Try to find the matching value
  for (let i = 0; i < optionsCount; i++) {
    if (options[i].id === currentValue) {
      return options[i].name;
    }
  }

  throw new Error("Could not determine current selection in dropdown");
}
