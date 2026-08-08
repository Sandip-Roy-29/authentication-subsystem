export default {
    testEnvironment: "node",
    transform: {},
    verbose: true,
    setupFiles: ["<rootDir>/tests/setups/setupMock.js"],
    setupFilesAfterEnv: ["<rootDir>/tests/setups/setupTest.js"],
    detectOpenHandles: true,
    moduleNameMapper: {
        "^#config/(.*)$": "<rootDir>/src/config/$1",
        "^#infra/(.*)$": "<rootDir>/src/infrastructure/$1",
        "^#modules/(.*)$": "<rootDir>/src/modules/$1",
        "^#shared/(.*)$": "<rootDir>/src/shared/$1",
        "^#routes/(.*)$": "<rootDir>/src/routes/$1",

        "^#env$": "<rootDir>/src/config/env/index.js",
        "^#bootstrap$": "<rootDir>/src/bootstraps/index.js",
        "^#composition$": "<rootDir>/src/composition/createApplication.js",
    },
};
