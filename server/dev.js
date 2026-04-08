/**
 * Local development entry point
 * Wraps the serverless app with an HTTP listener for local testing
 * Do NOT deploy this file to production—Vercel uses api/index.js instead
 */

import "dotenv/config";
import app from "./api/index.js";

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Dev server running on http://localhost:${PORT}`);
  });
}

export default app;
