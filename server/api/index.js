import "dotenv/config";
import { createApp } from "../src/app.js";

// Routers
import authRoutes from "../src/routes/auth.routes.js";
import errorMiddleware from "../src/middleware/error.middleware.js";

const app = createApp();

app.use("/api/v1/auth", authRoutes);
app.use(errorMiddleware);

export default app;
