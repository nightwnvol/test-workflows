export const sync_back = async ({
  github,
  context,
  core,
  version,
  reviewers,
}) => {
  // Create a PR to sync develop with main after merging a new release
  try {
    // Create PR
    const { data: pr } = await github.rest.pulls.create({
      owner: context.repo.owner,
      repo: context.repo.repo,
      title: `maint: sync develop with main after release ${version}`,
      head: "main",
      base: "develop",
      body: `This is an automated PR to sync the develop branch with the latest changes from main after the release of version ${version}.`,
    });
    core.info(`Created sync PR at ${pr.html_url}`);
    // Request review
    await github.rest.pulls.requestReviewers({
      owner: context.repo.owner,
      repo: context.repo.repo,
      pull_number: pr.number,
      reviewers: reviewers,
    });
    core.info(`Requested review from maintainers: ${reviewers.join(", ")}`);
  } catch (error) {
    if (error.status === 422 && error.message.includes("No commits between")) {
      core.info("No sync needed: develop is already up to date with main");
    } else {
      throw error;
    }
  }
  core.info(`Develop branch is now in sync with main after release ${version}`);
};
