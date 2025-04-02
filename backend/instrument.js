require("dotenv").config();
const Sentry = require("@sentry/node");

// Get Node.js major version
const nodeMajorVersion = parseInt(process.version.slice(1).split('.')[0], 10);

// Initialize Sentry with conditional profiling based on Node.js version
const sentryOptions = {
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0, // Capture 100% of the transactions
  integrations: []
};

// Only enable profiling for supported Node.js versions (16, 18, 20, 22)
if ([16, 18, 20, 22].includes(nodeMajorVersion)) {
  const { nodeProfilingIntegration } = require("@sentry/profiling-node");
  sentryOptions.integrations.push(nodeProfilingIntegration());
  sentryOptions.profileSessionSampleRate = 1.0;
} else {
  console.log(`Sentry profiling is not enabled for Node.js version ${process.version}`);
}

Sentry.init(sentryOptions);
// Manually call startProfiler and stopProfiler
// to profile the code in between
Sentry.profiler.startProfiler();

// Starts a transaction that will also be profiled
Sentry.startSpan({
  name: "My First Transaction",
}, () => {
  // the code executing inside the transaction will be wrapped in a span and profiled
});

// Calls to stopProfiler are optional - if you don't stop the profile session, it will keep profiling
// your application until the process exits or stopProfiler is called.
Sentry.profiler.stopProfiler();