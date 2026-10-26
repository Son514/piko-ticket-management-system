import { type } from "arktype";
import { secretString } from "@prisma/composer/arktype";
import nextjs from "@prisma/composer/nextjs";
import { compute } from "@prisma/composer-prisma-cloud";
import { postgres } from "@prisma/composer-prisma-cloud/orm";

import { appContract } from "./src/prisma/composer.ts";

export default compute({
  name: "app",
  deps: {
    database: postgres(appContract),
  },
  input: type({
    "smtpHost?": secretString(),
    "smtpPort?": secretString(),
    "smtpUser?": secretString(),
    "smtpPass?": secretString(),
    "emailFrom?": secretString(),
  }),
  build: nextjs({ module: import.meta.url, appDir: "." }),
});
