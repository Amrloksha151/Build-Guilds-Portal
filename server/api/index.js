import { createApp } from "../src/app.js";

// Routers
import authRoutes from "../src/routes/auth.routes.js";

const app = createApp();

app.use("/api/v1/auth", authRoutes);

export default app;