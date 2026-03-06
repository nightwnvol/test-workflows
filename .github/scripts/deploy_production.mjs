export const create_release = async ({
  github,
  context,
  core,
  tag,
  commit_sha,
}) => {
  // Create a new release
  await github.rest.repos.createRelease({
    owner: context.repo.owner,
    repo: context.repo.repo,
    tag_name: tag,
    name: tag,
    target_commitish: commit_sha,
    generate_release_notes: true,
  });
  core.info(`Created release with tag ${tag} targeting commit ${commit_sha}`);
};

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
