"use strict";

export let LogLevel = /*#__PURE__*/function (LogLevel) {
  LogLevel[LogLevel["IVSLogLevelDebug"] = 0] = "IVSLogLevelDebug";
  LogLevel[LogLevel["IVSLogLevelInfo"] = 1] = "IVSLogLevelInfo";
  LogLevel[LogLevel["IVSLogLevelWarning"] = 2] = "IVSLogLevelWarning";
  LogLevel[LogLevel["IVSLogLevelError"] = 3] = "IVSLogLevelError";
  return LogLevel;
}({});
export let PlayerState = /*#__PURE__*/function (PlayerState) {
  PlayerState["Idle"] = "Idle";
  PlayerState["Ready"] = "Ready";
  PlayerState["Buffering"] = "Buffering";
  PlayerState["Playing"] = "Playing";
  PlayerState["Ended"] = "Ended";
  return PlayerState;
}({});
//# sourceMappingURL=enums.js.map