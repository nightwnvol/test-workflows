export const get_pr_package_version = async ({
  github,
  context,
  core,
  ref,
}) => {
  core.info(`Fetching package.json from branch ${ref}`);
  const response = await github.rest.repos.getContent({
    owner: context.repo.owner,
    repo: context.repo.repo,
    path: "package.json",
    ref: ref, // Use the provided ref to get the content from the correct branch
  });

  const content = Buffer.from(response.data.content, "base64").toString();
  const packageJson = JSON.parse(content);
  const version = packageJson.version;

  // Validate version format (semver)
  if (!/^\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?(\+[a-zA-Z0-9.-]+)?$/.test(version)) {
    core.setFailed(`Invalid version format: ${version}. Must be valid semver.`);
    throw new Error("Invalid version format");
  }

  core.info(`Extracted version from package.json: ${version}`);
  return version;
};
