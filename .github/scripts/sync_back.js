module.exports = async ({ github, context, core }) => {
  const owner = context.repo.owner;
  const repo = context.repo.repo;
  const version = process.env.VERSION;

  try {
    // Create a PR to sync develop with main
    const { data: pr } = await github.rest.pulls.create({
      owner,
      repo,
      title: `maint: sync develop with main after release ${version}`,
      head: "main",
      base: "develop",
      body: `This is an automated PR to sync the develop branch with the latest changes from main after the release of version ${version}.`,
    });

    core.info(`Created sync PR: ${pr.html_url}`);
  } catch (error) {
    if (error.status === 422 && error.message.includes("No commits between")) {
      core.info("No sync needed - develop is already up to date with main");
    } else {
      throw error;
    }
  }
};
