export const create_release = async ({ github, context, core }) => {
  const tag = process.env.TAG;

  // Create a new release on GitHub
  await github.rest.repos.createRelease({
    owner: context.repo.owner,
    repo: context.repo.repo,
    tag_name: tag,
    name: tag,
    target_commitish: process.env.COMMIT_SHA,
    generate_release_notes: true,
  });
};

export const sync_back = async ({ github, context, core }) => {
  const version = process.env.VERSION;

  // Create a PR to sync develop with main after merging a new release
  try {
    const { data: pr } = await github.rest.pulls.create({
      owner: context.repo.owner,
      repo: context.repo.repo,
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
