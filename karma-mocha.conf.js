/* eslint-env node */
/* eslint-disable import/unambiguous */
/* eslint-disable import/no-commonjs */

const assign = require('lodash/assign');
const webpackConfiguration = require('./webpack.config.js');

const isCi = Boolean(process.env.TRAVIS);
const browserStackAvailable = Boolean(process.env.BROWSER_STACK_ACCESS_TOKEN);

const allBrowsers = [
  ['Chrome', '53', 'Windows', '10'],
  ['Firefox', '48', 'Windows', '10'],
  ['IE', '11', 'Windows', '10'],
  ['Chrome', '53', 'OS X', 'Sierra'],
  ['Firefox', '48', 'OS X', 'Sierra'],
];

module.exports = function(config) {
  config.set({
    basePath: '',

    frameworks: [
      'mocha',
      'chai-as-promised',
      'sinon-chai',
    ],

    files: [
      'spec/index.js',
    ],

    preprocessors: {
      'spec/index.js': ['webpack', 'sourcemap'],
    },

    webpack: assign({}, webpackConfiguration, {
      devtool: 'inline-source-map',
    }),

    webpackMiddleware: {
      stats: 'errors-only',
    },

    mochaReporter: {
      output: isCi ? 'mocha' : 'autowatch',
      showDiff: true,
    },

    reporters: ['mocha'],

    port: 9876,

    colors: true,

    logLevel: config.LOG_WARN,

    browsers: ['Chrome'],

    concurrency: Infinity,
  });

  if (browserStackAvailable) {
    const customLaunchers = {};
    allBrowsers.forEach((browser) => {
      customLaunchers[`browserStack${browser[0]}${browser[2]}`] = {
        base: 'BrowserStack',
        browser: browser[0],
        browser_version: browser[1], // eslint-disable-line camelcase
        os: browser[2],
        os_version: browser[3], // eslint-disable-line camelcase
      };
    });

    config.set({
      browserStack: {
        username: process.env.BROWSER_STACK_USERNAME,
        accessKey: process.env.BROWSER_STACK_ACCESS_KEY,
      },

      browserNoActivityTimeout: 60000,

      customLaunchers,

      browsers: Reflect.getOwnPropertyNames(customLaunchers),

      reporters: ['mocha', 'BrowserStack'],
    });
  } else if (isCi) {
    config.set({browsers: ['Firefox']});
  }
};