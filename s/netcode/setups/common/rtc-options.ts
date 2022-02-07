
import {standardRtcConfig} from "sparrow-rtc"

export const rtcOptions = {
	timeout: 60_000,
	heartbeatPeriod: 101,
	rtcConfig: standardRtcConfig,
	signalServerUrl: `wss://sparrow-rtc.benevolent.games/`,
}
