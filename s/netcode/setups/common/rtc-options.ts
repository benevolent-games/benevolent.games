
import {standardRtcConfig} from "sparrow-rtc/x/connect/utils/standard-rtc-config.js"

export const rtcOptions = {
	timeout: 10_000,
	heartbeatPeriod: 101,
	rtcConfig: standardRtcConfig,
	signalServerUrl: `wss://sparrow-rtc.benevolent.games/`,
}
