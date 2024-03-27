import { z } from "zod";

const stringBool = (defaultValue: string) =>
  z
    .string()
    .default(defaultValue)
    .refine((s) => s === "true" || s === "false")
    .transform((s) => s === "true");

const allEnv = z.object({
  API_URL: z.string().url().default("http://localhost:3000"),
  DISABLE_SIGNUPS: stringBool("false"),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_BASE_URL: z.string().url().optional(),
  OLLAMA_BASE_URL: z.string().url().optional(),
  INFERENCE_TEXT_MODEL: z.string().default("gpt-3.5-turbo-0125"),
  INFERENCE_IMAGE_MODEL: z.string().default("gpt-4-vision-preview"),
  REDIS_HOST: z.string().default("localhost"),
  REDIS_PORT: z.coerce.number().default(6379),
  CRAWLER_HEADLESS_BROWSER: stringBool("true"),
  BROWSER_EXECUTABLE_PATH: z.string().optional(), // If not set, the system's browser will be used
  BROWSER_USER_DATA_DIR: z.string().optional(),
  BROWSER_WEB_URL: z.string().url().optional(),
  MEILI_ADDR: z.string().optional(),
  MEILI_MASTER_KEY: z.string().default(""),
  LOG_LEVEL: z.string().default("debug"),
  DEMO_MODE: stringBool("false"),
  DEMO_MODE_EMAIL: z.string().optional(),
  DEMO_MODE_PASSWORD: z.string().optional(),
  DATA_DIR: z.string().default(""),
});

const serverConfigSchema = allEnv.transform((val) => {
  return {
    apiUrl: val.API_URL,
    auth: {
      disableSignups: val.DISABLE_SIGNUPS,
    },
    inference: {
      openAIApiKey: val.OPENAI_API_KEY,
      openAIBaseUrl: val.OPENAI_BASE_URL,
      ollamaBaseUrl: val.OLLAMA_BASE_URL,
      textModel: val.INFERENCE_TEXT_MODEL,
      imageModel: val.INFERENCE_IMAGE_MODEL,
    },
    bullMQ: {
      redisHost: val.REDIS_HOST,
      redisPort: val.REDIS_PORT,
    },
    crawler: {
      headlessBrowser: val.CRAWLER_HEADLESS_BROWSER,
      browserExecutablePath: val.BROWSER_EXECUTABLE_PATH,
      browserUserDataDir: val.BROWSER_USER_DATA_DIR,
      browserWebUrl: val.BROWSER_WEB_URL,
    },
    meilisearch: val.MEILI_ADDR
      ? {
          address: val.MEILI_ADDR,
          key: val.MEILI_MASTER_KEY,
        }
      : undefined,
    logLevel: val.LOG_LEVEL,
    demoMode: val.DEMO_MODE
      ? {
          email: val.DEMO_MODE_EMAIL,
          password: val.DEMO_MODE_PASSWORD,
        }
      : undefined,
    dataDir: val.DATA_DIR,
  };
});

const serverConfig = serverConfigSchema.parse(process.env);
// Always explicitly pick up stuff from server config to avoid accidentally leaking stuff
export const clientConfig = {
  demoMode: serverConfig.demoMode,
  auth: {
    disableSignups: serverConfig.auth.disableSignups,
  },
};
export type ClientConfig = typeof clientConfig;

export default serverConfig;
