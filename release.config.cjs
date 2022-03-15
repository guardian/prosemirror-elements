module.exports = {
  debug: true,
  branches: [
    { name: "main" },
    {
      name: "beta",
      prerelease: true,
    },
  ],
  plugins: [
    [
      "@semantic-release/commit-analyzer",
      {
        preset: "conventionalcommits",
      },
    ],
  ],
};
