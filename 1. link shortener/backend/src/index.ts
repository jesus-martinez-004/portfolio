import { createServer } from "./config/server";
import { env } from "./config/env";
import { logger } from "@logger/logger";

const app = createServer();

app.listen(env.PORT, () => {
    logger.info(`🚀 Server running on port ${env.PORT}`);
});
