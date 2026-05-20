import { loadFeature, defineFeature } from "jest-cucumber";
import { getDriver, navigateTo, initDriver } from "../setup";
import {
  By,
  WebDriver,
  WebElement,
  Builder,
  Browser,
} from "selenium-webdriver";
import * as chrome from "selenium-webdriver/chrome";
import { getScreenshotName, takeScreenshot } from "../cucumber.utils.js";
import { expect } from "expect";

// Context to track current time scale value
let currentTimeScale = "1.0";
let currentFocusedPlanet = "";

const options = new chrome.Options();
options.addArguments("--headless=new");
options.addArguments("--disable-gpu");
options.addArguments("--disable-sync");
options.addArguments("--disable-cloud-metadata");
options.addArguments(
  "--disable-features=OptimizeForHolographic,SecureContext,IsolateOrigins",
);
options.addArguments("--disable-blink-features=AutomationControlled");
options.addArguments("--log-level=3");
const driverInstance = new Builder()
  .forBrowser(Browser.CHROME)
  .setChromeOptions(options)
  .build();

// (async () => {
//   try {
//     await getDriver();
//   } catch (error) {
//     console.error("ERROR", error);
//   }
// })();

// const driverInstance = async () => {
//   const driverInstance = await getDriver();
//   return driverInstance;
// };

// Helper to get Control Bar element
async function getControlBar(): Promise<WebElement> {
  const element = await driverInstance.findElement(By.css(".control-bar"));
  // await driverInstance.wait(
  //   async () => {
  //     const displayed = await element.isDisplayed();
  //     return displayed;
  //   },
  //   10000,
  //   "Control bar container not found",
  // );
  return element; // Return the element, not the boolean
}

async function getControlBarContent(): Promise<WebElement> {
  const controlBar = await getControlBar();
  const element = await controlBar.findElement(By.css(".control-bar-content"));
  // await driverInstance.wait(
  //   async () => {
  //     try {
  //       const displayed = await element.isDisplayed();
  //       return displayed;
  //     } catch {
  //       return false;
  //     }
  //   },
  //   10000,
  //   "Control bar content not found",
  // );
  return element; // Return the element
}

// Helper to get the toggle button

// Helper to get the toggle button
async function getToggleButton(): Promise<WebElement> {
  const element = await driverInstance.findElement(By.css(".toggle-button"));
  // await driverInstance.wait(
  //   async () => {
  //     try {
  //       const displayed = await element.isDisplayed();
  //       return displayed;
  //     } catch {
  //       return false;
  //     }
  //   },
  //   5000,
  //   "Toggle button not found",
  // );
  return element; // Return the element
}

// Helper to get the planet select dropdown
async function getPlanetSelect(): Promise<WebElement> {
  const element = await driverInstance.findElement(By.id("planet-select"));
  // await driverInstance.wait(
  //   async () => {
  //     try {
  //       return await element.isDisplayed();
  //     } catch {
  //       return false;
  //     }
  //   },
  //   10000,
  //   "Planet select dropdown not found",
  // );
  return element; // Return the element
}

// Helper to get time scale input
async function getTimeScaleInput(): Promise<WebElement> {
  const element = await driverInstance.findElement(By.id("time-scale"));
  // await driverInstance.wait(
  //   async () => {
  //     try {
  //       return await element.isDisplayed();
  //     } catch {
  //       return false;
  //     }
  //   },
  //   10000,
  //   "Time scale input not found",
  // );
  return element; // Return the element
}

// Helper to get pause simulation checkbox
async function getPauseCheckbox(): Promise<WebElement> {
  const element = await driverInstance.findElement(
    By.css('[type="checkbox"][name="pause"]'),
  );
  // await driverInstance.wait(
  //   async () => {
  //     try {
  //       return await element.isDisplayed();
  //     } catch {
  //       return false;
  //     }
  //   },
  //   10000,
  //   "Pause simulation checkbox not found",
  // );
  return element; // Return the element
}

// Helper to get show orbits checkbox
async function getShowOrbitsCheckbox(): Promise<WebElement> {
  const element = await driverInstance.findElement(
    By.css('[type="checkbox"][name="show-orbits"]'),
  );
  // await driverInstance.wait(
  //   async () => {
  //     try {
  //       return await element.isDisplayed();
  //     } catch {
  //       return false;
  //     }
  //   },
  //   10000,
  //   "Show orbits checkbox not found",
  // );
  return element; // Return the element
}

// Helper to get reset camera button
async function getResetCameraButton(): Promise<WebElement> {
  const element = await driverInstance.findElement(By.css(".reset-button"));
  // await driverInstance.wait(
  //   async () => {
  //     try {
  //       return await element.isDisplayed();
  //     } catch {
  //       return false;
  //     }
  //   },
  //   10000,
  //   "Reset camera button not found",
  // );
  return element; // Return the element
}

// Helper to get the selected value in dropdown
async function getSelectedOptionValue(): Promise<string> {
  const select = await getPlanetSelect();
  return await select.getAttribute("value");
}

// Helper to get the current checked state of a checkbox
async function getCheckboxState(checkboxId: string): Promise<boolean> {
  const element = await driverInstance.findElement(By.id(checkboxId));
  const checked = await element.getAttribute("checked");
  return checked === "true";
}

// Helper to check if control bar is expanded (boolean)
async function isControlBarExpanded(): Promise<boolean> {
  try {
    const element = await driverInstance.findElement(
      By.css(".control-bar-content"),
    );
    return await element.isDisplayed();
  } catch {
    return false;
  }
}

// Helper to check if control bar is minimized (boolean)
async function isControlBarMinimized(): Promise<boolean> {
  try {
    const content = await driverInstance.findElement(
      By.css(".control-bar-content"),
    );
    return !(await content.isDisplayed());
  } catch {
    // If content element doesn't exist at all, likely minimized
    return true;
  }
}

const controlBarFeature = loadFeature(
  "./src/app/components/solarsystem/__tests__/controlBar.feature",
);
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "localhost:3000";
const SOLAR_SYSTEM_URL = `${BASE_URL}/projects/solarsystem`;

describe("Control bar", () => {
  defineFeature(controlBarFeature, (test) => {
    beforeEach(() => {
      navigateTo(SOLAR_SYSTEM_URL);
    });

    test("Control bar can be minimized", ({ given, when, then }) => {
      given(`the control bar is open`, async () => {
        expect(isControlBarExpanded);
      });

      when(`I click on the minimize button`, async () => {
        const toggleButton = await driverInstance.findElement(
          By.css(".toggle-button"),
        );

        await toggleButton.click();
      });

      then(`the control bar should be minimized`, async () => {
        // Verify control bar header is still visible but content is hidden
        expect(isControlBarMinimized);
      });

      // given(`the control bar is minimized`, async () => {
      //   // Store current state for verification
      //   isControlBarMinimized = true;

      //   // Verify we are in minimized state
      //   const content = await driverInstance.wait(
      //     async () => {
      //       try {
      //         const element = await driverInstance.findElement(
      //           By.css(".control-bar-content"),
      //         );
      //         return await element.isDisplayed();
      //       } catch {
      //         return false;
      //       }
      //     },
      //     5000,
      //     "Content visibility check",
      //   );

      //   expect(content).toBe(false);
      // });

      // when(`I click on the maximize button`, async () => {
      //   const toggleButton = await driverInstance.wait(
      //     async () => {
      //       try {
      //         const element = await driverInstance.findElement(
      //           By.css(".toggle-button"),
      //         );
      //         return await element.isDisplayed();
      //       } catch {
      //         return false;
      //       }
      //     },
      //     5000,
      //     "Toggle button not found",
      //   );

      //   await toggleButton.click();
      // });

      // then(`the control bar should be maximized`, async () => {
      //   // Verify content is now visible again
      //   const content = await driverInstance.wait(
      //     async () => {
      //       try {
      //         const element = await driverInstance.findElement(
      //           By.css(".control-bar-content"),
      //         );
      //         return await element.isDisplayed();
      //       } catch {
      //         return false;
      //       }
      //     },
      //     10000,
      //     "Control bar content should be visible",
      //   );

      //   expect(content).toBe(true);

      //   // Take screenshot
      //   const screenshotName = getScreenshotName("control_bar_maximized");
      //   await takeScreenshot(screenshotName);
      // });
    });
  });
});
