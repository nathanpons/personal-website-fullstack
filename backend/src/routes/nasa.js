import express from "express";
import dotenv from "dotenv";
import { checkSchema, validationResult } from "express-validator";
import { cacheMiddleware } from "../middleware/cache.js";

dotenv.config();

const router = express.Router();
const baseUrl = process.env.BASE_URL;

const nasaApodSchema = {
  title: {
    trim: true,
    escape: true,
    isLength: {
      options: { min: 1, max: 200 },
      errorMessage: "Title must be 1-200 characters",
    },
  },
  explanation: {
    trim: true,
    escape: true,
    isLength: {
      options: { min: 1, max: 5000 },
      errorMessage: "Explanation too long",
    },
  },
  copyright: {
    optional: true,
    trim: true,
    escape: true,
  },
  url: {
    isURL: {
      options: {
        protocols: ["http", "https"],
        require_tld: true,
        require_protocol: true,
        host_whitelist: ["nasa.gov", "api.nasa.gov", "apod.nasa.gov"],
      },
      errorMessage: "Invalid URL",
    },
  },
  hdurl: {
    optional: true,
    isURL: {
      options: {
        protocols: ["http", "https"],
        require_tld: true,
        require_protocol: true,
        host_whitelist: ["nasa.gov", "api.nasa.gov", "apod.nasa.gov"],
      },
      errorMessage: "Invalid URL",
    },
  },
  date: {
    isISO8601: true,
    toDate: true,
  },
  media_type: {
    isIn: {
      options: [["image"]],
      errorMessage: "Media type must be image",
    },
  },
  service_version: {
    optional: true,
    isString: true,
  },
};

const validateData = async (data, schema) => {
  const req = { body: data };
  const validationChain = checkSchema(schema, ["body"]);

  await validationChain.run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new Error(`Validation error: ${JSON.stringify(errors.array())}`);
  }

  return data;
};

router.get("/apod", cacheMiddleware(3600), async (req, res) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

  const fallbackExplanation =
    "NASA's Astronomy Picture of the Day is currently unavailable. This is a fallback image. ";
  const fallbackResponse = {
    date: new Date("01 October 2025").toISOString(),
    explanation: `${fallbackExplanation} \nTen thousand years ago, before the dawn of recorded human history, a new light would suddenly have appeared in the night sky and faded after a few weeks. Today we know this light was from a supernova, or exploding star, and record the expanding debris cloud as the Veil Nebula, a supernova remnant. This sharp telescopic view is centered on a western segment of the Veil Nebula cataloged as NGC 6960 but less formally known as the Witch's Broom Nebula. Blasted out in the cataclysmic explosion, an interstellar shock wave plows through space sweeping up and exciting interstellar material. Imaged with narrow band filters, the glowing filaments are like long ripples in a sheet seen almost edge on, remarkably well separated into atomic hydrogen (red) and oxygen (blue-green) gas. The complete supernova remnant lies about 1400 light-years away towards the constellation Cygnus. This Witch's Broom actually spans about 35 light-years. The bright star in the frame is 52 Cygni, visible with the unaided eye from a dark location but unrelated to the ancient supernova remnant.`,
    media_type: "image",
    service_version: "v1",
    title: "NGC 6960: The Witch's Broom Nebula",
    url: `${baseUrl}/api/static/WitchBroom_Meyers_1080.jpg`,
    hdurl: "",
  };

  try {
    const response = await fetch(
      `https://api.nasa.gov/planetary/apod?api_key=${process.env.NASA_API_KEY}`,
      { signal: controller.signal },
    );
    clearTimeout(timeoutId); // Clear timeout on success

    if (!response.ok) {
      throw new Error(`NASA API error: ${response.statusText}`);
    }

    const rawData = await response.json();
    try {
      const data = await validateData(rawData, nasaApodSchema);

      res.json(data);
    } catch (validationError) {
      console.error("Validation error for NASA APOD data:", validationError);
      res.status(200).json(fallbackResponse);
    }
  } catch (error) {
    clearTimeout(timeoutId); // Clear timeout on error
    if (error.name === "AbortError") {
      console.error("NASA APOD request timed out:", error);
      // Return fallback JSON object on timeout due to lack of nasa api support
      return res.status(200).json(fallbackResponse);
    } else if (error.code === "ENOTFOUND" || error.code === "EAI_AGAIN") {
      console.error("Network error fetching NASA APOD:", error);
      return res.status(200).json(fallbackResponse);
    } else {
      console.error("Error fetching NASA APOD:", error);
      return res.status(200).json(fallbackResponse);
    }
  }
});

export default router;
