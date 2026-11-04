import { Config } from "@remotion/cli/config";
Config.setVideoImageFormat("jpeg");
Config.setCodec("h264");
if (process.env.REMOTION_BROWSER) Config.setBrowserExecutable(process.env.REMOTION_BROWSER);
