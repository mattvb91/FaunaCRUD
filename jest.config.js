require('dotenv').config()

module.exports = {
    "globals": {
        "ts-jest": { "tsconfig": __dirname + "/tsconfig.json" }
    },
    preset: "ts-jest",
    coverageReporters: ["clover", "lcov"],
    collectCoverage: true,
    rootDir: process.cwd(),
    coverageDirectory: `<rootDir>/tests/.coverage/`,
    collectCoverageFrom: [
        `<rootDir>/src/**/*.ts`,
        `<rootDir>/server/**/*.ts`,
    ],
}