var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

// .wrangler/tmp/bundle-WwL5Sb/strip-cf-connecting-ip-header.js
function stripCfConnectingIPHeader(input, init) {
  const request = new Request(input, init);
  request.headers.delete("CF-Connecting-IP");
  return request;
}
__name(stripCfConnectingIPHeader, "stripCfConnectingIPHeader");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    return Reflect.apply(target, thisArg, [
      stripCfConnectingIPHeader.apply(null, argArray)
    ]);
  }
});

// ../../node_modules/.pnpm/unenv@2.0.0-rc.14/node_modules/unenv/dist/runtime/_internal/utils.mjs
function createNotImplementedError(name) {
  return new Error(`[unenv] ${name} is not implemented yet!`);
}
__name(createNotImplementedError, "createNotImplementedError");
function notImplemented(name) {
  const fn = /* @__PURE__ */ __name(() => {
    throw createNotImplementedError(name);
  }, "fn");
  return Object.assign(fn, { __unenv__: true });
}
__name(notImplemented, "notImplemented");
function notImplementedClass(name) {
  return class {
    __unenv__ = true;
    constructor() {
      throw new Error(`[unenv] ${name} is not implemented yet!`);
    }
  };
}
__name(notImplementedClass, "notImplementedClass");

// ../../node_modules/.pnpm/unenv@2.0.0-rc.14/node_modules/unenv/dist/runtime/node/internal/perf_hooks/performance.mjs
var _timeOrigin = globalThis.performance?.timeOrigin ?? Date.now();
var _performanceNow = globalThis.performance?.now ? globalThis.performance.now.bind(globalThis.performance) : () => Date.now() - _timeOrigin;
var nodeTiming = {
  name: "node",
  entryType: "node",
  startTime: 0,
  duration: 0,
  nodeStart: 0,
  v8Start: 0,
  bootstrapComplete: 0,
  environment: 0,
  loopStart: 0,
  loopExit: 0,
  idleTime: 0,
  uvMetricsInfo: {
    loopCount: 0,
    events: 0,
    eventsWaiting: 0
  },
  detail: void 0,
  toJSON() {
    return this;
  }
};
var PerformanceEntry = class {
  __unenv__ = true;
  detail;
  entryType = "event";
  name;
  startTime;
  constructor(name, options) {
    this.name = name;
    this.startTime = options?.startTime || _performanceNow();
    this.detail = options?.detail;
  }
  get duration() {
    return _performanceNow() - this.startTime;
  }
  toJSON() {
    return {
      name: this.name,
      entryType: this.entryType,
      startTime: this.startTime,
      duration: this.duration,
      detail: this.detail
    };
  }
};
__name(PerformanceEntry, "PerformanceEntry");
var PerformanceMark = /* @__PURE__ */ __name(class PerformanceMark2 extends PerformanceEntry {
  entryType = "mark";
  constructor() {
    super(...arguments);
  }
  get duration() {
    return 0;
  }
}, "PerformanceMark");
var PerformanceMeasure = class extends PerformanceEntry {
  entryType = "measure";
};
__name(PerformanceMeasure, "PerformanceMeasure");
var PerformanceResourceTiming = class extends PerformanceEntry {
  entryType = "resource";
  serverTiming = [];
  connectEnd = 0;
  connectStart = 0;
  decodedBodySize = 0;
  domainLookupEnd = 0;
  domainLookupStart = 0;
  encodedBodySize = 0;
  fetchStart = 0;
  initiatorType = "";
  name = "";
  nextHopProtocol = "";
  redirectEnd = 0;
  redirectStart = 0;
  requestStart = 0;
  responseEnd = 0;
  responseStart = 0;
  secureConnectionStart = 0;
  startTime = 0;
  transferSize = 0;
  workerStart = 0;
  responseStatus = 0;
};
__name(PerformanceResourceTiming, "PerformanceResourceTiming");
var PerformanceObserverEntryList = class {
  __unenv__ = true;
  getEntries() {
    return [];
  }
  getEntriesByName(_name, _type) {
    return [];
  }
  getEntriesByType(type) {
    return [];
  }
};
__name(PerformanceObserverEntryList, "PerformanceObserverEntryList");
var Performance = class {
  __unenv__ = true;
  timeOrigin = _timeOrigin;
  eventCounts = /* @__PURE__ */ new Map();
  _entries = [];
  _resourceTimingBufferSize = 0;
  navigation = void 0;
  timing = void 0;
  timerify(_fn, _options) {
    throw createNotImplementedError("Performance.timerify");
  }
  get nodeTiming() {
    return nodeTiming;
  }
  eventLoopUtilization() {
    return {};
  }
  markResourceTiming() {
    return new PerformanceResourceTiming("");
  }
  onresourcetimingbufferfull = null;
  now() {
    if (this.timeOrigin === _timeOrigin) {
      return _performanceNow();
    }
    return Date.now() - this.timeOrigin;
  }
  clearMarks(markName) {
    this._entries = markName ? this._entries.filter((e) => e.name !== markName) : this._entries.filter((e) => e.entryType !== "mark");
  }
  clearMeasures(measureName) {
    this._entries = measureName ? this._entries.filter((e) => e.name !== measureName) : this._entries.filter((e) => e.entryType !== "measure");
  }
  clearResourceTimings() {
    this._entries = this._entries.filter((e) => e.entryType !== "resource" || e.entryType !== "navigation");
  }
  getEntries() {
    return this._entries;
  }
  getEntriesByName(name, type) {
    return this._entries.filter((e) => e.name === name && (!type || e.entryType === type));
  }
  getEntriesByType(type) {
    return this._entries.filter((e) => e.entryType === type);
  }
  mark(name, options) {
    const entry = new PerformanceMark(name, options);
    this._entries.push(entry);
    return entry;
  }
  measure(measureName, startOrMeasureOptions, endMark) {
    let start;
    let end;
    if (typeof startOrMeasureOptions === "string") {
      start = this.getEntriesByName(startOrMeasureOptions, "mark")[0]?.startTime;
      end = this.getEntriesByName(endMark, "mark")[0]?.startTime;
    } else {
      start = Number.parseFloat(startOrMeasureOptions?.start) || this.now();
      end = Number.parseFloat(startOrMeasureOptions?.end) || this.now();
    }
    const entry = new PerformanceMeasure(measureName, {
      startTime: start,
      detail: {
        start,
        end
      }
    });
    this._entries.push(entry);
    return entry;
  }
  setResourceTimingBufferSize(maxSize) {
    this._resourceTimingBufferSize = maxSize;
  }
  addEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.addEventListener");
  }
  removeEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.removeEventListener");
  }
  dispatchEvent(event) {
    throw createNotImplementedError("Performance.dispatchEvent");
  }
  toJSON() {
    return this;
  }
};
__name(Performance, "Performance");
var PerformanceObserver = class {
  __unenv__ = true;
  _callback = null;
  constructor(callback) {
    this._callback = callback;
  }
  takeRecords() {
    return [];
  }
  disconnect() {
    throw createNotImplementedError("PerformanceObserver.disconnect");
  }
  observe(options) {
    throw createNotImplementedError("PerformanceObserver.observe");
  }
  bind(fn) {
    return fn;
  }
  runInAsyncScope(fn, thisArg, ...args) {
    return fn.call(thisArg, ...args);
  }
  asyncId() {
    return 0;
  }
  triggerAsyncId() {
    return 0;
  }
  emitDestroy() {
    return this;
  }
};
__name(PerformanceObserver, "PerformanceObserver");
__publicField(PerformanceObserver, "supportedEntryTypes", []);
var performance = globalThis.performance && "addEventListener" in globalThis.performance ? globalThis.performance : new Performance();

// ../../node_modules/.pnpm/@cloudflare+unenv-preset@2.0.2_unenv@2.0.0-rc.14_workerd@1.20250718.0/node_modules/@cloudflare/unenv-preset/dist/runtime/polyfill/performance.mjs
globalThis.performance = performance;
globalThis.Performance = Performance;
globalThis.PerformanceEntry = PerformanceEntry;
globalThis.PerformanceMark = PerformanceMark;
globalThis.PerformanceMeasure = PerformanceMeasure;
globalThis.PerformanceObserver = PerformanceObserver;
globalThis.PerformanceObserverEntryList = PerformanceObserverEntryList;
globalThis.PerformanceResourceTiming = PerformanceResourceTiming;

// ../../node_modules/.pnpm/unenv@2.0.0-rc.14/node_modules/unenv/dist/runtime/node/console.mjs
import { Writable } from "node:stream";

// ../../node_modules/.pnpm/unenv@2.0.0-rc.14/node_modules/unenv/dist/runtime/mock/noop.mjs
var noop_default = Object.assign(() => {
}, { __unenv__: true });

// ../../node_modules/.pnpm/unenv@2.0.0-rc.14/node_modules/unenv/dist/runtime/node/console.mjs
var _console = globalThis.console;
var _ignoreErrors = true;
var _stderr = new Writable();
var _stdout = new Writable();
var log = _console?.log ?? noop_default;
var info = _console?.info ?? log;
var trace = _console?.trace ?? info;
var debug = _console?.debug ?? log;
var table = _console?.table ?? log;
var error = _console?.error ?? log;
var warn = _console?.warn ?? error;
var createTask = _console?.createTask ?? /* @__PURE__ */ notImplemented("console.createTask");
var clear = _console?.clear ?? noop_default;
var count = _console?.count ?? noop_default;
var countReset = _console?.countReset ?? noop_default;
var dir = _console?.dir ?? noop_default;
var dirxml = _console?.dirxml ?? noop_default;
var group = _console?.group ?? noop_default;
var groupEnd = _console?.groupEnd ?? noop_default;
var groupCollapsed = _console?.groupCollapsed ?? noop_default;
var profile = _console?.profile ?? noop_default;
var profileEnd = _console?.profileEnd ?? noop_default;
var time = _console?.time ?? noop_default;
var timeEnd = _console?.timeEnd ?? noop_default;
var timeLog = _console?.timeLog ?? noop_default;
var timeStamp = _console?.timeStamp ?? noop_default;
var Console = _console?.Console ?? /* @__PURE__ */ notImplementedClass("console.Console");
var _times = /* @__PURE__ */ new Map();
var _stdoutErrorHandler = noop_default;
var _stderrErrorHandler = noop_default;

// ../../node_modules/.pnpm/@cloudflare+unenv-preset@2.0.2_unenv@2.0.0-rc.14_workerd@1.20250718.0/node_modules/@cloudflare/unenv-preset/dist/runtime/node/console.mjs
var workerdConsole = globalThis["console"];
var {
  assert,
  clear: clear2,
  // @ts-expect-error undocumented public API
  context,
  count: count2,
  countReset: countReset2,
  // @ts-expect-error undocumented public API
  createTask: createTask2,
  debug: debug2,
  dir: dir2,
  dirxml: dirxml2,
  error: error2,
  group: group2,
  groupCollapsed: groupCollapsed2,
  groupEnd: groupEnd2,
  info: info2,
  log: log2,
  profile: profile2,
  profileEnd: profileEnd2,
  table: table2,
  time: time2,
  timeEnd: timeEnd2,
  timeLog: timeLog2,
  timeStamp: timeStamp2,
  trace: trace2,
  warn: warn2
} = workerdConsole;
Object.assign(workerdConsole, {
  Console,
  _ignoreErrors,
  _stderr,
  _stderrErrorHandler,
  _stdout,
  _stdoutErrorHandler,
  _times
});
var console_default = workerdConsole;

// ../../node_modules/.pnpm/wrangler@3.114.17_@cloudflare+workers-types@4.20260523.1/node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-console
globalThis.console = console_default;

// ../../node_modules/.pnpm/unenv@2.0.0-rc.14/node_modules/unenv/dist/runtime/node/internal/process/hrtime.mjs
var hrtime = /* @__PURE__ */ Object.assign(/* @__PURE__ */ __name(function hrtime2(startTime) {
  const now = Date.now();
  const seconds = Math.trunc(now / 1e3);
  const nanos = now % 1e3 * 1e6;
  if (startTime) {
    let diffSeconds = seconds - startTime[0];
    let diffNanos = nanos - startTime[0];
    if (diffNanos < 0) {
      diffSeconds = diffSeconds - 1;
      diffNanos = 1e9 + diffNanos;
    }
    return [diffSeconds, diffNanos];
  }
  return [seconds, nanos];
}, "hrtime"), { bigint: /* @__PURE__ */ __name(function bigint() {
  return BigInt(Date.now() * 1e6);
}, "bigint") });

// ../../node_modules/.pnpm/unenv@2.0.0-rc.14/node_modules/unenv/dist/runtime/node/internal/process/process.mjs
import { EventEmitter } from "node:events";

// ../../node_modules/.pnpm/unenv@2.0.0-rc.14/node_modules/unenv/dist/runtime/node/internal/tty/read-stream.mjs
import { Socket } from "node:net";
var ReadStream = class extends Socket {
  fd;
  constructor(fd) {
    super();
    this.fd = fd;
  }
  isRaw = false;
  setRawMode(mode) {
    this.isRaw = mode;
    return this;
  }
  isTTY = false;
};
__name(ReadStream, "ReadStream");

// ../../node_modules/.pnpm/unenv@2.0.0-rc.14/node_modules/unenv/dist/runtime/node/internal/tty/write-stream.mjs
import { Socket as Socket2 } from "node:net";
var WriteStream = class extends Socket2 {
  fd;
  constructor(fd) {
    super();
    this.fd = fd;
  }
  clearLine(dir3, callback) {
    callback && callback();
    return false;
  }
  clearScreenDown(callback) {
    callback && callback();
    return false;
  }
  cursorTo(x, y, callback) {
    callback && typeof callback === "function" && callback();
    return false;
  }
  moveCursor(dx, dy, callback) {
    callback && callback();
    return false;
  }
  getColorDepth(env2) {
    return 1;
  }
  hasColors(count3, env2) {
    return false;
  }
  getWindowSize() {
    return [this.columns, this.rows];
  }
  columns = 80;
  rows = 24;
  isTTY = false;
};
__name(WriteStream, "WriteStream");

// ../../node_modules/.pnpm/unenv@2.0.0-rc.14/node_modules/unenv/dist/runtime/node/internal/process/process.mjs
var Process = class extends EventEmitter {
  env;
  hrtime;
  nextTick;
  constructor(impl) {
    super();
    this.env = impl.env;
    this.hrtime = impl.hrtime;
    this.nextTick = impl.nextTick;
    for (const prop of [...Object.getOwnPropertyNames(Process.prototype), ...Object.getOwnPropertyNames(EventEmitter.prototype)]) {
      const value = this[prop];
      if (typeof value === "function") {
        this[prop] = value.bind(this);
      }
    }
  }
  emitWarning(warning, type, code) {
    console.warn(`${code ? `[${code}] ` : ""}${type ? `${type}: ` : ""}${warning}`);
  }
  emit(...args) {
    return super.emit(...args);
  }
  listeners(eventName) {
    return super.listeners(eventName);
  }
  #stdin;
  #stdout;
  #stderr;
  get stdin() {
    return this.#stdin ??= new ReadStream(0);
  }
  get stdout() {
    return this.#stdout ??= new WriteStream(1);
  }
  get stderr() {
    return this.#stderr ??= new WriteStream(2);
  }
  #cwd = "/";
  chdir(cwd2) {
    this.#cwd = cwd2;
  }
  cwd() {
    return this.#cwd;
  }
  arch = "";
  platform = "";
  argv = [];
  argv0 = "";
  execArgv = [];
  execPath = "";
  title = "";
  pid = 200;
  ppid = 100;
  get version() {
    return "";
  }
  get versions() {
    return {};
  }
  get allowedNodeEnvironmentFlags() {
    return /* @__PURE__ */ new Set();
  }
  get sourceMapsEnabled() {
    return false;
  }
  get debugPort() {
    return 0;
  }
  get throwDeprecation() {
    return false;
  }
  get traceDeprecation() {
    return false;
  }
  get features() {
    return {};
  }
  get release() {
    return {};
  }
  get connected() {
    return false;
  }
  get config() {
    return {};
  }
  get moduleLoadList() {
    return [];
  }
  constrainedMemory() {
    return 0;
  }
  availableMemory() {
    return 0;
  }
  uptime() {
    return 0;
  }
  resourceUsage() {
    return {};
  }
  ref() {
  }
  unref() {
  }
  umask() {
    throw createNotImplementedError("process.umask");
  }
  getBuiltinModule() {
    return void 0;
  }
  getActiveResourcesInfo() {
    throw createNotImplementedError("process.getActiveResourcesInfo");
  }
  exit() {
    throw createNotImplementedError("process.exit");
  }
  reallyExit() {
    throw createNotImplementedError("process.reallyExit");
  }
  kill() {
    throw createNotImplementedError("process.kill");
  }
  abort() {
    throw createNotImplementedError("process.abort");
  }
  dlopen() {
    throw createNotImplementedError("process.dlopen");
  }
  setSourceMapsEnabled() {
    throw createNotImplementedError("process.setSourceMapsEnabled");
  }
  loadEnvFile() {
    throw createNotImplementedError("process.loadEnvFile");
  }
  disconnect() {
    throw createNotImplementedError("process.disconnect");
  }
  cpuUsage() {
    throw createNotImplementedError("process.cpuUsage");
  }
  setUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.setUncaughtExceptionCaptureCallback");
  }
  hasUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.hasUncaughtExceptionCaptureCallback");
  }
  initgroups() {
    throw createNotImplementedError("process.initgroups");
  }
  openStdin() {
    throw createNotImplementedError("process.openStdin");
  }
  assert() {
    throw createNotImplementedError("process.assert");
  }
  binding() {
    throw createNotImplementedError("process.binding");
  }
  permission = { has: /* @__PURE__ */ notImplemented("process.permission.has") };
  report = {
    directory: "",
    filename: "",
    signal: "SIGUSR2",
    compact: false,
    reportOnFatalError: false,
    reportOnSignal: false,
    reportOnUncaughtException: false,
    getReport: /* @__PURE__ */ notImplemented("process.report.getReport"),
    writeReport: /* @__PURE__ */ notImplemented("process.report.writeReport")
  };
  finalization = {
    register: /* @__PURE__ */ notImplemented("process.finalization.register"),
    unregister: /* @__PURE__ */ notImplemented("process.finalization.unregister"),
    registerBeforeExit: /* @__PURE__ */ notImplemented("process.finalization.registerBeforeExit")
  };
  memoryUsage = Object.assign(() => ({
    arrayBuffers: 0,
    rss: 0,
    external: 0,
    heapTotal: 0,
    heapUsed: 0
  }), { rss: () => 0 });
  mainModule = void 0;
  domain = void 0;
  send = void 0;
  exitCode = void 0;
  channel = void 0;
  getegid = void 0;
  geteuid = void 0;
  getgid = void 0;
  getgroups = void 0;
  getuid = void 0;
  setegid = void 0;
  seteuid = void 0;
  setgid = void 0;
  setgroups = void 0;
  setuid = void 0;
  _events = void 0;
  _eventsCount = void 0;
  _exiting = void 0;
  _maxListeners = void 0;
  _debugEnd = void 0;
  _debugProcess = void 0;
  _fatalException = void 0;
  _getActiveHandles = void 0;
  _getActiveRequests = void 0;
  _kill = void 0;
  _preload_modules = void 0;
  _rawDebug = void 0;
  _startProfilerIdleNotifier = void 0;
  _stopProfilerIdleNotifier = void 0;
  _tickCallback = void 0;
  _disconnect = void 0;
  _handleQueue = void 0;
  _pendingMessage = void 0;
  _channel = void 0;
  _send = void 0;
  _linkedBinding = void 0;
};
__name(Process, "Process");

// ../../node_modules/.pnpm/@cloudflare+unenv-preset@2.0.2_unenv@2.0.0-rc.14_workerd@1.20250718.0/node_modules/@cloudflare/unenv-preset/dist/runtime/node/process.mjs
var globalProcess = globalThis["process"];
var getBuiltinModule = globalProcess.getBuiltinModule;
var { exit, platform, nextTick } = getBuiltinModule(
  "node:process"
);
var unenvProcess = new Process({
  env: globalProcess.env,
  hrtime,
  nextTick
});
var {
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  hasUncaughtExceptionCaptureCallback,
  setUncaughtExceptionCaptureCallback,
  loadEnvFile,
  sourceMapsEnabled,
  arch,
  argv,
  argv0,
  chdir,
  config,
  connected,
  constrainedMemory,
  availableMemory,
  cpuUsage,
  cwd,
  debugPort,
  dlopen,
  disconnect,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  finalization,
  features,
  getActiveResourcesInfo,
  getMaxListeners,
  hrtime: hrtime3,
  kill,
  listeners,
  listenerCount,
  memoryUsage,
  on,
  off,
  once,
  pid,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  setMaxListeners,
  setSourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  title,
  throwDeprecation,
  traceDeprecation,
  umask,
  uptime,
  version,
  versions,
  domain,
  initgroups,
  moduleLoadList,
  reallyExit,
  openStdin,
  assert: assert2,
  binding,
  send,
  exitCode,
  channel,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getuid,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setuid,
  permission,
  mainModule,
  _events,
  _eventsCount,
  _exiting,
  _maxListeners,
  _debugEnd,
  _debugProcess,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _kill,
  _preload_modules,
  _rawDebug,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  _disconnect,
  _handleQueue,
  _pendingMessage,
  _channel,
  _send,
  _linkedBinding
} = unenvProcess;
var _process = {
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  hasUncaughtExceptionCaptureCallback,
  setUncaughtExceptionCaptureCallback,
  loadEnvFile,
  sourceMapsEnabled,
  arch,
  argv,
  argv0,
  chdir,
  config,
  connected,
  constrainedMemory,
  availableMemory,
  cpuUsage,
  cwd,
  debugPort,
  dlopen,
  disconnect,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  exit,
  finalization,
  features,
  getBuiltinModule,
  getActiveResourcesInfo,
  getMaxListeners,
  hrtime: hrtime3,
  kill,
  listeners,
  listenerCount,
  memoryUsage,
  nextTick,
  on,
  off,
  once,
  pid,
  platform,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  setMaxListeners,
  setSourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  title,
  throwDeprecation,
  traceDeprecation,
  umask,
  uptime,
  version,
  versions,
  // @ts-expect-error old API
  domain,
  initgroups,
  moduleLoadList,
  reallyExit,
  openStdin,
  assert: assert2,
  binding,
  send,
  exitCode,
  channel,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getuid,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setuid,
  permission,
  mainModule,
  _events,
  _eventsCount,
  _exiting,
  _maxListeners,
  _debugEnd,
  _debugProcess,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _kill,
  _preload_modules,
  _rawDebug,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  _disconnect,
  _handleQueue,
  _pendingMessage,
  _channel,
  _send,
  _linkedBinding
};
var process_default = _process;

// ../../node_modules/.pnpm/wrangler@3.114.17_@cloudflare+workers-types@4.20260523.1/node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-process
globalThis.process = process_default;

// src/logger.ts
function createLogger(ctx) {
  const base = { rid: ctx.requestId, method: ctx.method, path: ctx.path, ip: ctx.ip };
  function emit2(level, msg, fields) {
    console[level](JSON.stringify({ ts: Date.now(), level, msg, ...base, ...fields }));
  }
  __name(emit2, "emit");
  return {
    info: (msg, fields) => emit2("info", msg, fields),
    warn: (msg, fields) => emit2("warn", msg, fields),
    error: (msg, fields) => emit2("error", msg, fields)
  };
}
__name(createLogger, "createLogger");

// src/router.ts
var Router = class {
  routes = [];
  add(method, path, handler, ...middlewares) {
    this.routes.push({
      method,
      pattern: new URLPattern({ pathname: path }),
      handler,
      middlewares
    });
  }
  async handle(ctx) {
    for (const route of this.routes) {
      if (route.method !== ctx.request.method)
        continue;
      const match = route.pattern.exec({ pathname: ctx.url.pathname });
      if (!match)
        continue;
      ctx.params = match.pathname.groups || {};
      let fn = route.handler;
      for (let i = route.middlewares.length - 1; i >= 0; i--) {
        const mw = route.middlewares[i];
        const next = fn;
        fn = /* @__PURE__ */ __name((c) => mw(c, next), "fn");
      }
      return fn(ctx);
    }
    return null;
  }
};
__name(Router, "Router");

// src/constants.ts
var KV_KEY = {
  NAV_SITES: "nav:sites.json",
  NAV_CATEGORIES: "nav:categories.json"
};
var KV_PREFIX = {
  RATE_LIMIT: "rl:",
  SESSION: "session:"
};
var TTL = {
  RATE_LIMIT: 3600,
  // 1 hour
  SESSION: 86400 * 7
  // 7 days
};
var LIMITS = {
  SUBMISSIONS_PER_HOUR: 5,
  MAX_LIST_LIMIT: 100,
  DEFAULT_LIST_LIMIT: 50,
  MAX_TITLE_LENGTH: 100,
  MIN_DESCRIPTION_LENGTH: 10,
  MAX_DESCRIPTION_LENGTH: 200
};
var SITE_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected"
};

// ../../node_modules/.pnpm/mustache@4.2.0/node_modules/mustache/mustache.mjs
var objectToString = Object.prototype.toString;
var isArray = Array.isArray || /* @__PURE__ */ __name(function isArrayPolyfill(object) {
  return objectToString.call(object) === "[object Array]";
}, "isArrayPolyfill");
function isFunction(object) {
  return typeof object === "function";
}
__name(isFunction, "isFunction");
function typeStr(obj) {
  return isArray(obj) ? "array" : typeof obj;
}
__name(typeStr, "typeStr");
function escapeRegExp(string) {
  return string.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
}
__name(escapeRegExp, "escapeRegExp");
function hasProperty(obj, propName) {
  return obj != null && typeof obj === "object" && propName in obj;
}
__name(hasProperty, "hasProperty");
function primitiveHasOwnProperty(primitive, propName) {
  return primitive != null && typeof primitive !== "object" && primitive.hasOwnProperty && primitive.hasOwnProperty(propName);
}
__name(primitiveHasOwnProperty, "primitiveHasOwnProperty");
var regExpTest = RegExp.prototype.test;
function testRegExp(re, string) {
  return regExpTest.call(re, string);
}
__name(testRegExp, "testRegExp");
var nonSpaceRe = /\S/;
function isWhitespace(string) {
  return !testRegExp(nonSpaceRe, string);
}
__name(isWhitespace, "isWhitespace");
var entityMap = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
  "/": "&#x2F;",
  "`": "&#x60;",
  "=": "&#x3D;"
};
function escapeHtml(string) {
  return String(string).replace(/[&<>"'`=\/]/g, /* @__PURE__ */ __name(function fromEntityMap(s) {
    return entityMap[s];
  }, "fromEntityMap"));
}
__name(escapeHtml, "escapeHtml");
var whiteRe = /\s*/;
var spaceRe = /\s+/;
var equalsRe = /\s*=/;
var curlyRe = /\s*\}/;
var tagRe = /#|\^|\/|>|\{|&|=|!/;
function parseTemplate(template, tags) {
  if (!template)
    return [];
  var lineHasNonSpace = false;
  var sections = [];
  var tokens = [];
  var spaces = [];
  var hasTag = false;
  var nonSpace = false;
  var indentation = "";
  var tagIndex = 0;
  function stripSpace() {
    if (hasTag && !nonSpace) {
      while (spaces.length)
        delete tokens[spaces.pop()];
    } else {
      spaces = [];
    }
    hasTag = false;
    nonSpace = false;
  }
  __name(stripSpace, "stripSpace");
  var openingTagRe, closingTagRe, closingCurlyRe;
  function compileTags(tagsToCompile) {
    if (typeof tagsToCompile === "string")
      tagsToCompile = tagsToCompile.split(spaceRe, 2);
    if (!isArray(tagsToCompile) || tagsToCompile.length !== 2)
      throw new Error("Invalid tags: " + tagsToCompile);
    openingTagRe = new RegExp(escapeRegExp(tagsToCompile[0]) + "\\s*");
    closingTagRe = new RegExp("\\s*" + escapeRegExp(tagsToCompile[1]));
    closingCurlyRe = new RegExp("\\s*" + escapeRegExp("}" + tagsToCompile[1]));
  }
  __name(compileTags, "compileTags");
  compileTags(tags || mustache.tags);
  var scanner = new Scanner(template);
  var start, type, value, chr, token, openSection;
  while (!scanner.eos()) {
    start = scanner.pos;
    value = scanner.scanUntil(openingTagRe);
    if (value) {
      for (var i = 0, valueLength = value.length; i < valueLength; ++i) {
        chr = value.charAt(i);
        if (isWhitespace(chr)) {
          spaces.push(tokens.length);
          indentation += chr;
        } else {
          nonSpace = true;
          lineHasNonSpace = true;
          indentation += " ";
        }
        tokens.push(["text", chr, start, start + 1]);
        start += 1;
        if (chr === "\n") {
          stripSpace();
          indentation = "";
          tagIndex = 0;
          lineHasNonSpace = false;
        }
      }
    }
    if (!scanner.scan(openingTagRe))
      break;
    hasTag = true;
    type = scanner.scan(tagRe) || "name";
    scanner.scan(whiteRe);
    if (type === "=") {
      value = scanner.scanUntil(equalsRe);
      scanner.scan(equalsRe);
      scanner.scanUntil(closingTagRe);
    } else if (type === "{") {
      value = scanner.scanUntil(closingCurlyRe);
      scanner.scan(curlyRe);
      scanner.scanUntil(closingTagRe);
      type = "&";
    } else {
      value = scanner.scanUntil(closingTagRe);
    }
    if (!scanner.scan(closingTagRe))
      throw new Error("Unclosed tag at " + scanner.pos);
    if (type == ">") {
      token = [type, value, start, scanner.pos, indentation, tagIndex, lineHasNonSpace];
    } else {
      token = [type, value, start, scanner.pos];
    }
    tagIndex++;
    tokens.push(token);
    if (type === "#" || type === "^") {
      sections.push(token);
    } else if (type === "/") {
      openSection = sections.pop();
      if (!openSection)
        throw new Error('Unopened section "' + value + '" at ' + start);
      if (openSection[1] !== value)
        throw new Error('Unclosed section "' + openSection[1] + '" at ' + start);
    } else if (type === "name" || type === "{" || type === "&") {
      nonSpace = true;
    } else if (type === "=") {
      compileTags(value);
    }
  }
  stripSpace();
  openSection = sections.pop();
  if (openSection)
    throw new Error('Unclosed section "' + openSection[1] + '" at ' + scanner.pos);
  return nestTokens(squashTokens(tokens));
}
__name(parseTemplate, "parseTemplate");
function squashTokens(tokens) {
  var squashedTokens = [];
  var token, lastToken;
  for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
    token = tokens[i];
    if (token) {
      if (token[0] === "text" && lastToken && lastToken[0] === "text") {
        lastToken[1] += token[1];
        lastToken[3] = token[3];
      } else {
        squashedTokens.push(token);
        lastToken = token;
      }
    }
  }
  return squashedTokens;
}
__name(squashTokens, "squashTokens");
function nestTokens(tokens) {
  var nestedTokens = [];
  var collector = nestedTokens;
  var sections = [];
  var token, section;
  for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
    token = tokens[i];
    switch (token[0]) {
      case "#":
      case "^":
        collector.push(token);
        sections.push(token);
        collector = token[4] = [];
        break;
      case "/":
        section = sections.pop();
        section[5] = token[2];
        collector = sections.length > 0 ? sections[sections.length - 1][4] : nestedTokens;
        break;
      default:
        collector.push(token);
    }
  }
  return nestedTokens;
}
__name(nestTokens, "nestTokens");
function Scanner(string) {
  this.string = string;
  this.tail = string;
  this.pos = 0;
}
__name(Scanner, "Scanner");
Scanner.prototype.eos = /* @__PURE__ */ __name(function eos() {
  return this.tail === "";
}, "eos");
Scanner.prototype.scan = /* @__PURE__ */ __name(function scan(re) {
  var match = this.tail.match(re);
  if (!match || match.index !== 0)
    return "";
  var string = match[0];
  this.tail = this.tail.substring(string.length);
  this.pos += string.length;
  return string;
}, "scan");
Scanner.prototype.scanUntil = /* @__PURE__ */ __name(function scanUntil(re) {
  var index = this.tail.search(re), match;
  switch (index) {
    case -1:
      match = this.tail;
      this.tail = "";
      break;
    case 0:
      match = "";
      break;
    default:
      match = this.tail.substring(0, index);
      this.tail = this.tail.substring(index);
  }
  this.pos += match.length;
  return match;
}, "scanUntil");
function Context(view, parentContext) {
  this.view = view;
  this.cache = { ".": this.view };
  this.parent = parentContext;
}
__name(Context, "Context");
Context.prototype.push = /* @__PURE__ */ __name(function push(view) {
  return new Context(view, this);
}, "push");
Context.prototype.lookup = /* @__PURE__ */ __name(function lookup(name) {
  var cache = this.cache;
  var value;
  if (cache.hasOwnProperty(name)) {
    value = cache[name];
  } else {
    var context2 = this, intermediateValue, names, index, lookupHit = false;
    while (context2) {
      if (name.indexOf(".") > 0) {
        intermediateValue = context2.view;
        names = name.split(".");
        index = 0;
        while (intermediateValue != null && index < names.length) {
          if (index === names.length - 1)
            lookupHit = hasProperty(intermediateValue, names[index]) || primitiveHasOwnProperty(intermediateValue, names[index]);
          intermediateValue = intermediateValue[names[index++]];
        }
      } else {
        intermediateValue = context2.view[name];
        lookupHit = hasProperty(context2.view, name);
      }
      if (lookupHit) {
        value = intermediateValue;
        break;
      }
      context2 = context2.parent;
    }
    cache[name] = value;
  }
  if (isFunction(value))
    value = value.call(this.view);
  return value;
}, "lookup");
function Writer() {
  this.templateCache = {
    _cache: {},
    set: /* @__PURE__ */ __name(function set(key, value) {
      this._cache[key] = value;
    }, "set"),
    get: /* @__PURE__ */ __name(function get(key) {
      return this._cache[key];
    }, "get"),
    clear: /* @__PURE__ */ __name(function clear3() {
      this._cache = {};
    }, "clear")
  };
}
__name(Writer, "Writer");
Writer.prototype.clearCache = /* @__PURE__ */ __name(function clearCache() {
  if (typeof this.templateCache !== "undefined") {
    this.templateCache.clear();
  }
}, "clearCache");
Writer.prototype.parse = /* @__PURE__ */ __name(function parse(template, tags) {
  var cache = this.templateCache;
  var cacheKey = template + ":" + (tags || mustache.tags).join(":");
  var isCacheEnabled = typeof cache !== "undefined";
  var tokens = isCacheEnabled ? cache.get(cacheKey) : void 0;
  if (tokens == void 0) {
    tokens = parseTemplate(template, tags);
    isCacheEnabled && cache.set(cacheKey, tokens);
  }
  return tokens;
}, "parse");
Writer.prototype.render = /* @__PURE__ */ __name(function render(template, view, partials, config2) {
  var tags = this.getConfigTags(config2);
  var tokens = this.parse(template, tags);
  var context2 = view instanceof Context ? view : new Context(view, void 0);
  return this.renderTokens(tokens, context2, partials, template, config2);
}, "render");
Writer.prototype.renderTokens = /* @__PURE__ */ __name(function renderTokens(tokens, context2, partials, originalTemplate, config2) {
  var buffer = "";
  var token, symbol, value;
  for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
    value = void 0;
    token = tokens[i];
    symbol = token[0];
    if (symbol === "#")
      value = this.renderSection(token, context2, partials, originalTemplate, config2);
    else if (symbol === "^")
      value = this.renderInverted(token, context2, partials, originalTemplate, config2);
    else if (symbol === ">")
      value = this.renderPartial(token, context2, partials, config2);
    else if (symbol === "&")
      value = this.unescapedValue(token, context2);
    else if (symbol === "name")
      value = this.escapedValue(token, context2, config2);
    else if (symbol === "text")
      value = this.rawValue(token);
    if (value !== void 0)
      buffer += value;
  }
  return buffer;
}, "renderTokens");
Writer.prototype.renderSection = /* @__PURE__ */ __name(function renderSection(token, context2, partials, originalTemplate, config2) {
  var self = this;
  var buffer = "";
  var value = context2.lookup(token[1]);
  function subRender(template) {
    return self.render(template, context2, partials, config2);
  }
  __name(subRender, "subRender");
  if (!value)
    return;
  if (isArray(value)) {
    for (var j = 0, valueLength = value.length; j < valueLength; ++j) {
      buffer += this.renderTokens(token[4], context2.push(value[j]), partials, originalTemplate, config2);
    }
  } else if (typeof value === "object" || typeof value === "string" || typeof value === "number") {
    buffer += this.renderTokens(token[4], context2.push(value), partials, originalTemplate, config2);
  } else if (isFunction(value)) {
    if (typeof originalTemplate !== "string")
      throw new Error("Cannot use higher-order sections without the original template");
    value = value.call(context2.view, originalTemplate.slice(token[3], token[5]), subRender);
    if (value != null)
      buffer += value;
  } else {
    buffer += this.renderTokens(token[4], context2, partials, originalTemplate, config2);
  }
  return buffer;
}, "renderSection");
Writer.prototype.renderInverted = /* @__PURE__ */ __name(function renderInverted(token, context2, partials, originalTemplate, config2) {
  var value = context2.lookup(token[1]);
  if (!value || isArray(value) && value.length === 0)
    return this.renderTokens(token[4], context2, partials, originalTemplate, config2);
}, "renderInverted");
Writer.prototype.indentPartial = /* @__PURE__ */ __name(function indentPartial(partial, indentation, lineHasNonSpace) {
  var filteredIndentation = indentation.replace(/[^ \t]/g, "");
  var partialByNl = partial.split("\n");
  for (var i = 0; i < partialByNl.length; i++) {
    if (partialByNl[i].length && (i > 0 || !lineHasNonSpace)) {
      partialByNl[i] = filteredIndentation + partialByNl[i];
    }
  }
  return partialByNl.join("\n");
}, "indentPartial");
Writer.prototype.renderPartial = /* @__PURE__ */ __name(function renderPartial(token, context2, partials, config2) {
  if (!partials)
    return;
  var tags = this.getConfigTags(config2);
  var value = isFunction(partials) ? partials(token[1]) : partials[token[1]];
  if (value != null) {
    var lineHasNonSpace = token[6];
    var tagIndex = token[5];
    var indentation = token[4];
    var indentedValue = value;
    if (tagIndex == 0 && indentation) {
      indentedValue = this.indentPartial(value, indentation, lineHasNonSpace);
    }
    var tokens = this.parse(indentedValue, tags);
    return this.renderTokens(tokens, context2, partials, indentedValue, config2);
  }
}, "renderPartial");
Writer.prototype.unescapedValue = /* @__PURE__ */ __name(function unescapedValue(token, context2) {
  var value = context2.lookup(token[1]);
  if (value != null)
    return value;
}, "unescapedValue");
Writer.prototype.escapedValue = /* @__PURE__ */ __name(function escapedValue(token, context2, config2) {
  var escape = this.getConfigEscape(config2) || mustache.escape;
  var value = context2.lookup(token[1]);
  if (value != null)
    return typeof value === "number" && escape === mustache.escape ? String(value) : escape(value);
}, "escapedValue");
Writer.prototype.rawValue = /* @__PURE__ */ __name(function rawValue(token) {
  return token[1];
}, "rawValue");
Writer.prototype.getConfigTags = /* @__PURE__ */ __name(function getConfigTags(config2) {
  if (isArray(config2)) {
    return config2;
  } else if (config2 && typeof config2 === "object") {
    return config2.tags;
  } else {
    return void 0;
  }
}, "getConfigTags");
Writer.prototype.getConfigEscape = /* @__PURE__ */ __name(function getConfigEscape(config2) {
  if (config2 && typeof config2 === "object" && !isArray(config2)) {
    return config2.escape;
  } else {
    return void 0;
  }
}, "getConfigEscape");
var mustache = {
  name: "mustache.js",
  version: "4.2.0",
  tags: ["{{", "}}"],
  clearCache: void 0,
  escape: void 0,
  parse: void 0,
  render: void 0,
  Scanner: void 0,
  Context: void 0,
  Writer: void 0,
  /**
   * Allows a user to override the default caching strategy, by providing an
   * object with set, get and clear methods. This can also be used to disable
   * the cache by setting it to the literal `undefined`.
   */
  set templateCache(cache) {
    defaultWriter.templateCache = cache;
  },
  /**
   * Gets the default or overridden caching object from the default writer.
   */
  get templateCache() {
    return defaultWriter.templateCache;
  }
};
var defaultWriter = new Writer();
mustache.clearCache = /* @__PURE__ */ __name(function clearCache2() {
  return defaultWriter.clearCache();
}, "clearCache");
mustache.parse = /* @__PURE__ */ __name(function parse2(template, tags) {
  return defaultWriter.parse(template, tags);
}, "parse");
mustache.render = /* @__PURE__ */ __name(function render2(template, view, partials, config2) {
  if (typeof template !== "string") {
    throw new TypeError('Invalid template! Template should be a "string" but "' + typeStr(template) + '" was given as the first argument for mustache#render(template, view, partials)');
  }
  return defaultWriter.render(template, view, partials, config2);
}, "render");
mustache.escape = escapeHtml;
mustache.Scanner = Scanner;
mustache.Context = Context;
mustache.Writer = Writer;
var mustache_default = mustache;

// src/services/auth.ts
import loginTemplate from "./8d8c9db600891bcc1c1e7e0ae4a46cee5be92410-login.mustache";
var SESSION_COOKIE = "session";
function getSessionToken(request) {
  const cookie = request.headers.get("Cookie") || "";
  const match = cookie.match(/session=([^;]+)/);
  return match?.[1] || null;
}
__name(getSessionToken, "getSessionToken");
async function hasValidSession(request, env2) {
  const token = getSessionToken(request);
  if (!token)
    return false;
  const stored = await env2.KV.get(`${KV_PREFIX.SESSION}${token}`);
  return Boolean(stored);
}
__name(hasValidSession, "hasValidSession");
async function handleLogin(request, env2) {
  if (request.method === "GET") {
    return renderLogin();
  }
  const form = await request.formData();
  const user = form.get("user") || "";
  const pass = form.get("pass") || "";
  if (user !== env2.ADMIN_USER || pass !== env2.ADMIN_TOKEN) {
    return renderLogin('<div class="alert alert-error mt-4">\u7528\u6237\u540D\u6216\u5BC6\u7801\u9519\u8BEF</div>', 401);
  }
  const token = crypto.randomUUID();
  await env2.KV.put(`${KV_PREFIX.SESSION}${token}`, user, { expirationTtl: TTL.SESSION });
  const isLocal = new URL(request.url).hostname === "localhost";
  const flags = isLocal ? `Path=/; HttpOnly; Max-Age=${TTL.SESSION}` : `Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${TTL.SESSION}`;
  return new Response(null, {
    status: 303,
    headers: { Location: "/admin", "Set-Cookie": `${SESSION_COOKIE}=${token}; ${flags}` }
  });
}
__name(handleLogin, "handleLogin");
function handleLogout() {
  return new Response(null, {
    status: 302,
    headers: { Location: "/login", "Set-Cookie": `${SESSION_COOKIE}=; Path=/; HttpOnly; Max-Age=0` }
  });
}
__name(handleLogout, "handleLogout");
function renderLogin(error3 = "", status = 200) {
  const html = mustache_default.render(loginTemplate, { error: error3 });
  return new Response(html, { status, headers: { "Content-Type": "text/html; charset=utf-8" } });
}
__name(renderLogin, "renderLogin");

// src/middleware.ts
var Res = {
  json: (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } }),
  error: (message, status = 400) => Res.json({ error: message }, status),
  notFound: (message = "Not found") => Res.error(message, 404)
};
function addCorsHeaders(res) {
  const headers = new Headers(res.headers);
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type,Authorization");
  return new Response(res.body, { status: res.status, headers });
}
__name(addCorsHeaders, "addCorsHeaders");
async function rateLimitMiddleware(ctx, next) {
  const ip = ctx.request.headers.get("CF-Connecting-IP") || "unknown";
  const key = `${KV_PREFIX.RATE_LIMIT}${ip}`;
  const val = await ctx.env.KV.get(key);
  const count3 = val ? parseInt(val, 10) : 0;
  if (count3 >= LIMITS.SUBMISSIONS_PER_HOUR) {
    ctx.logger.warn("Rate limit exceeded", { ip, count: count3 });
    return Res.error(`Rate limit exceeded. Max ${LIMITS.SUBMISSIONS_PER_HOUR} submissions per hour.`, 429);
  }
  await ctx.env.KV.put(key, String(count3 + 1), { expirationTtl: TTL.RATE_LIMIT });
  return next(ctx);
}
__name(rateLimitMiddleware, "rateLimitMiddleware");

// src/repositories.ts
var D1SiteRepository = class {
  constructor(db) {
    this.db = db;
  }
  async create(data) {
    const id = crypto.randomUUID();
    await this.db.prepare(
      `INSERT INTO sites (id, title, url, description, logo, category_id, tags, submitter_name, submitter_email, submitter_reason)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id,
      data.title,
      data.url,
      data.description,
      data.logo || "",
      data.category_id,
      JSON.stringify(data.tags || []),
      data.submitter_name || "",
      data.submitter_email || "",
      data.submitter_reason || ""
    ).run();
    return id;
  }
  async findById(id) {
    return this.db.prepare("SELECT * FROM sites WHERE id = ?").bind(id).first();
  }
  async findByUrl(url) {
    return this.db.prepare("SELECT * FROM sites WHERE url = ?").bind(url).first();
  }
  async listApproved(opts) {
    let sql = `SELECT s.* FROM sites s JOIN categories c ON s.category_id = c.id WHERE s.status = '${SITE_STATUS.APPROVED}'`;
    const params = [];
    if (opts.category) {
      sql += " AND c.slug = ?";
      params.push(opts.category);
    }
    if (opts.featured) {
      sql += " AND s.featured = 1";
    }
    sql += " ORDER BY s.sort_order ASC, s.created_at DESC LIMIT ?";
    params.push(opts.limit);
    const { results } = await this.db.prepare(sql).bind(...params).all();
    const total = await this.db.prepare(`SELECT COUNT(*) as c FROM sites WHERE status = '${SITE_STATUS.APPROVED}'`).first();
    return { sites: results || [], total: total?.c || 0 };
  }
  async listPending() {
    const { results } = await this.db.prepare(`SELECT * FROM sites WHERE status = '${SITE_STATUS.PENDING}' ORDER BY created_at DESC`).all();
    return results || [];
  }
  async update(id, data) {
    const sets = [];
    const vals = [];
    if (data.status) {
      sets.push("status = ?", "reviewed_at = ?");
      vals.push(data.status, (/* @__PURE__ */ new Date()).toISOString());
    }
    if (data.reviewer_note !== void 0) {
      sets.push("reviewer_note = ?");
      vals.push(data.reviewer_note);
    }
    if (data.title) {
      sets.push("title = ?");
      vals.push(data.title);
    }
    if (data.description) {
      sets.push("description = ?");
      vals.push(data.description);
    }
    if (data.category_id) {
      sets.push("category_id = ?");
      vals.push(data.category_id);
    }
    if (data.featured !== void 0) {
      sets.push("featured = ?");
      vals.push(data.featured ? 1 : 0);
    }
    if (data.sort_order !== void 0) {
      sets.push("sort_order = ?");
      vals.push(data.sort_order);
    }
    sets.push("updated_at = ?");
    vals.push((/* @__PURE__ */ new Date()).toISOString());
    vals.push(id);
    await this.db.prepare(`UPDATE sites SET ${sets.join(", ")} WHERE id = ?`).bind(...vals).run();
  }
  async delete(id) {
    await this.db.prepare("DELETE FROM sites WHERE id = ?").bind(id).run();
  }
};
__name(D1SiteRepository, "D1SiteRepository");
var D1CategoryRepository = class {
  constructor(db) {
    this.db = db;
  }
  async findById(id) {
    return this.db.prepare("SELECT * FROM categories WHERE id = ?").bind(id).first();
  }
  async listAll() {
    const { results } = await this.db.prepare(
      `SELECT c.*, (SELECT COUNT(*) FROM sites s WHERE s.category_id = c.id AND s.status = '${SITE_STATUS.APPROVED}') as siteCount
         FROM categories c ORDER BY c.sort_order ASC`
    ).all();
    return results || [];
  }
};
__name(D1CategoryRepository, "D1CategoryRepository");
var KVPublisher = class {
  constructor(db, kv) {
    this.db = db;
    this.kv = kv;
  }
  async publish() {
    const { results: categories } = await this.db.prepare("SELECT * FROM categories ORDER BY sort_order ASC").all();
    const { results: sites } = await this.db.prepare(`SELECT * FROM sites WHERE status = '${SITE_STATUS.APPROVED}' ORDER BY sort_order ASC, created_at DESC`).all();
    const navData = {
      categories: (categories || []).map((cat) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon,
        sites: (sites || []).filter((s) => s.category_id === cat.id).map((s) => ({
          id: s.id,
          title: s.title,
          url: s.url,
          description: s.description,
          logo: s.logo,
          tags: JSON.parse(s.tags || "[]"),
          featured: s.featured === 1
        }))
      })),
      generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      totalSites: sites?.length || 0
    };
    await this.kv.put(KV_KEY.NAV_SITES, JSON.stringify(navData));
    return navData;
  }
};
__name(KVPublisher, "KVPublisher");

// src/handlers/sites.ts
var TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
async function verifyTurnstile(token, secret, ip) {
  const res = await fetch(TURNSTILE_VERIFY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ secret, response: token, remoteip: ip })
  });
  const data = await res.json();
  return data.success;
}
__name(verifyTurnstile, "verifyTurnstile");
function createSitesHandler(sites, categories) {
  return {
    async create(ctx) {
      const body = await ctx.request.json().catch(() => null);
      const { data, error: error3 } = validateCreateSite(body);
      if (error3 || !data)
        return Res.error(error3 || "Invalid body");
      const token = body?.turnstile_token;
      if (!token || typeof token !== "string")
        return Res.error("Turnstile verification required");
      const turnstileOk = await verifyTurnstile(token, ctx.env.TURNSTILE_SECRET, ctx.request.headers.get("CF-Connecting-IP") || "");
      if (!turnstileOk)
        return Res.error("Turnstile verification failed", 403);
      const existing = await sites.findByUrl(data.url);
      if (existing)
        return Res.error("This URL has already been submitted", 409);
      const cat = await categories.findById(data.category_id);
      if (!cat)
        return Res.error("Invalid category_id");
      const id = await sites.create(data);
      ctx.logger.info("site_submitted", { siteId: id, url: data.url });
      return Res.json({ id, message: "\u63D0\u4EA4\u6210\u529F\uFF0C\u7B49\u5F85\u5BA1\u6838" }, 201);
    },
    async list(ctx) {
      const category = ctx.url.searchParams.get("category") || void 0;
      const featured = ctx.url.searchParams.get("featured") === "true";
      const limit = Math.min(
        parseInt(ctx.url.searchParams.get("limit") || String(LIMITS.DEFAULT_LIST_LIMIT), 10),
        LIMITS.MAX_LIST_LIMIT
      );
      const result = await sites.listApproved({ category, featured, limit });
      return Res.json(result);
    }
  };
}
__name(createSitesHandler, "createSitesHandler");
function validateCreateSite(body) {
  if (!body || typeof body !== "object")
    return { error: "Invalid JSON body" };
  const b = body;
  if (!b.title || typeof b.title !== "string")
    return { error: "title is required" };
  if (!b.url || typeof b.url !== "string")
    return { error: "url is required" };
  if (!b.description || typeof b.description !== "string")
    return { error: "description is required" };
  if (!b.category_id || typeof b.category_id !== "string")
    return { error: "category_id is required" };
  try {
    new URL(b.url);
  } catch {
    return { error: "Invalid url format" };
  }
  const desc = b.description;
  if (desc.length < LIMITS.MIN_DESCRIPTION_LENGTH || desc.length > LIMITS.MAX_DESCRIPTION_LENGTH) {
    return { error: `description must be ${LIMITS.MIN_DESCRIPTION_LENGTH}-${LIMITS.MAX_DESCRIPTION_LENGTH} chars` };
  }
  return {
    data: {
      title: b.title.slice(0, LIMITS.MAX_TITLE_LENGTH),
      url: b.url,
      description: desc,
      category_id: b.category_id,
      logo: typeof b.logo === "string" ? b.logo : void 0,
      tags: Array.isArray(b.tags) ? b.tags.filter((t) => typeof t === "string") : void 0,
      submitter_name: typeof b.submitter_name === "string" ? b.submitter_name : void 0,
      submitter_email: typeof b.submitter_email === "string" ? b.submitter_email : void 0,
      submitter_reason: typeof b.submitter_reason === "string" ? b.submitter_reason : void 0
    }
  };
}
__name(validateCreateSite, "validateCreateSite");

// src/handlers/categories.ts
function createCategoriesHandler(categories) {
  return {
    async list(ctx) {
      const results = await categories.listAll();
      ctx.logger.info("categories_listed", { count: results.length });
      return Res.json({ categories: results });
    }
  };
}
__name(createCategoriesHandler, "createCategoriesHandler");

// src/handlers/admin.ts
function createAdminHandler(sites, publisher) {
  return {
    async listPending(ctx) {
      const results = await sites.listPending();
      ctx.logger.info("pending_listed", { count: results.length });
      return Res.json({ sites: results });
    },
    async update(ctx) {
      const id = ctx.params.id;
      const body = await ctx.request.json().catch(() => null);
      if (!body)
        return Res.error("Invalid JSON body");
      const existing = await sites.findById(id);
      if (!existing)
        return Res.notFound("Site not found");
      await sites.update(id, body);
      ctx.logger.info("site_updated", { siteId: id, status: body.status });
      return Res.json({ message: "Updated" });
    },
    async delete(ctx) {
      const id = ctx.params.id;
      const existing = await sites.findById(id);
      if (!existing)
        return Res.notFound("Site not found");
      await sites.delete(id);
      ctx.logger.info("site_deleted", { siteId: id });
      return Res.json({ message: "Deleted" });
    },
    async publish(ctx) {
      const navData = await publisher.publish();
      ctx.logger.info("published", { totalSites: navData.totalSites });
      return Res.json({ message: "\u53D1\u5E03\u6210\u529F", totalSites: navData.totalSites });
    }
  };
}
__name(createAdminHandler, "createAdminHandler");

// src/lib/layout.ts
import layoutTemplate from "./eba99c61281f5ad9ba010a32bf360afd9542e1ce-layout.mustache";
function layout(title2, content) {
  const html = mustache_default.render(layoutTemplate, { title: title2, content });
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
__name(layout, "layout");

// src/views/admin.ts
import pendingTemplate from "./17431fec74b2ec009cc61d06a5a2371188b331bd-pending.mustache";
import sitesTemplate from "./4676f10537398838fd19aeb6e473e78bdc38c28e-sites.mustache";
import categoriesTemplate from "./bffa2abc97177d6e76a5ec7e6d88b7ab2075a5c3-categories.mustache";
function renderPending(pending, approvedCount) {
  return mustache_default.render(pendingTemplate, {
    pendingCount: pending.length,
    approvedCount,
    totalCount: pending.length + approvedCount,
    hasPending: pending.length > 0,
    sites: pending
  });
}
__name(renderPending, "renderPending");
function renderSites(sites) {
  const viewSites = sites.map((s) => ({
    ...s,
    featured: s.featured === 1,
    statusBadge: statusBadge(s.status)
  }));
  return mustache_default.render(sitesTemplate, { sites: viewSites });
}
__name(renderSites, "renderSites");
function renderCategories(categories) {
  return mustache_default.render(categoriesTemplate, { categories });
}
__name(renderCategories, "renderCategories");
function statusBadge(status) {
  switch (status) {
    case "approved":
      return '<span class="badge badge-success badge-sm">\u5DF2\u901A\u8FC7</span>';
    case "rejected":
      return '<span class="badge badge-error badge-sm">\u5DF2\u62D2\u7EDD</span>';
    default:
      return '<span class="badge badge-warning badge-sm">\u5F85\u5BA1\u6838</span>';
  }
}
__name(statusBadge, "statusBadge");

// src/handlers/pages.ts
function createAdminPages(sites, categories) {
  return {
    async dashboard(ctx) {
      const pending = await sites.listPending();
      ctx.logger.info("admin_dashboard", { pendingCount: pending.length });
      return layout("\u4EEA\u8868\u76D8", renderPending(pending, 0));
    },
    async pending(ctx) {
      const pending = await sites.listPending();
      ctx.logger.info("admin_pending", { pendingCount: pending.length });
      return layout("\u5F85\u5BA1\u6838", renderPending(pending, 0));
    },
    async sitesList(ctx) {
      const { sites: allSites } = await sites.listApproved({ limit: 100 });
      ctx.logger.info("admin_sites", { count: allSites.length });
      return layout("\u6240\u6709\u7F51\u7AD9", renderSites(allSites));
    },
    async categoriesList(ctx) {
      const cats = await categories.listAll();
      ctx.logger.info("admin_categories", { count: cats.length });
      return layout("\u5206\u7C7B\u7BA1\u7406", renderCategories(cats));
    }
  };
}
__name(createAdminPages, "createAdminPages");

// src/index.ts
var src_default = {
  async fetch(request, env2) {
    if (request.method === "OPTIONS") {
      return addCorsHeaders(new Response(null, { status: 204 }));
    }
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    const logger = createLogger({
      requestId: crypto.randomUUID(),
      method,
      path,
      ip: request.headers.get("CF-Connecting-IP") || "unknown"
    });
    try {
      if (path === "/login" && method === "GET")
        return handleLogin(request, env2);
      if (path === "/login" && method === "POST")
        return handleLogin(request, env2);
      if (path === "/logout")
        return handleLogout();
      if (path.startsWith("/admin")) {
        const valid = await hasValidSession(request, env2);
        if (!valid)
          return Response.redirect(new URL("/login", request.url).toString(), 302);
      }
      if (path.startsWith("/api/sites/") && method !== "GET" || path === "/api/sites/pending") {
        const bearer = request.headers.get("Authorization")?.replace("Bearer ", "");
        const sessionOk = await hasValidSession(request, env2);
        if (bearer !== env2.ADMIN_TOKEN && !sessionOk) {
          return addCorsHeaders(Res.error("Unauthorized", 401));
        }
      }
      const siteRepo = new D1SiteRepository(env2.DB);
      const categoryRepo = new D1CategoryRepository(env2.DB);
      const publisher = new KVPublisher(env2.DB, env2.KV);
      const sitesHandler = createSitesHandler(siteRepo, categoryRepo);
      const categoriesHandler = createCategoriesHandler(categoryRepo);
      const adminHandler = createAdminHandler(siteRepo, publisher);
      const adminPages = createAdminPages(siteRepo, categoryRepo);
      const router = new Router();
      router.add("GET", "/api/nav", async (ctx2) => {
        const data = await ctx2.env.KV.get("nav:sites.json");
        if (!data)
          return Res.json({ categories: [], generatedAt: null, totalSites: 0 });
        return new Response(data, { headers: { "Content-Type": "application/json" } });
      });
      router.add("POST", "/api/sites", sitesHandler.create, rateLimitMiddleware);
      router.add("GET", "/api/sites", sitesHandler.list);
      router.add("GET", "/api/categories", categoriesHandler.list);
      router.add("GET", "/api/sites/pending", adminHandler.listPending);
      router.add("PUT", "/api/sites/:id", adminHandler.update);
      router.add("DELETE", "/api/sites/:id", adminHandler.delete);
      router.add("POST", "/api/sites/publish", adminHandler.publish);
      router.add("GET", "/admin", adminPages.dashboard);
      router.add("GET", "/admin/pending", adminPages.pending);
      router.add("GET", "/admin/sites", adminPages.sitesList);
      router.add("GET", "/admin/categories", adminPages.categoriesList);
      const ctx = { request, env: env2, params: {}, url, logger };
      const response = await router.handle(ctx);
      return addCorsHeaders(response || Res.notFound());
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Internal error";
      logger.error("unhandled", { error: msg });
      return addCorsHeaders(Res.error(msg, 500));
    }
  }
};

// ../../node_modules/.pnpm/wrangler@3.114.17_@cloudflare+workers-types@4.20260523.1/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env2, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env2);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../node_modules/.pnpm/wrangler@3.114.17_@cloudflare+workers-types@4.20260523.1/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env2, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env2);
  } catch (e) {
    const error3 = reduceError(e);
    return Response.json(error3, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-WwL5Sb/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// ../../node_modules/.pnpm/wrangler@3.114.17_@cloudflare+workers-types@4.20260523.1/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env2, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env2, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env2, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env2, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-WwL5Sb/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof __Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
__name(__Facade_ScheduledController__, "__Facade_ScheduledController__");
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env2, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env2, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env2, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env2, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env2, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = (request, env2, ctx) => {
      this.env = env2;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    };
    #dispatcher = (type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    };
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
/*! Bundled license information:

mustache/mustache.mjs:
  (*!
   * mustache.js - Logic-less {{mustache}} templates with JavaScript
   * http://github.com/janl/mustache.js
   *)
*/
//# sourceMappingURL=index.js.map
