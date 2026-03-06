export const check_release = async ({
  github,
  context,
  core,
  tag,
  source_branch = "main",
}) => {
  core.info(`Script fetched from branch ${source_branch}`);
  // List all releases
  const { data: releases } = await github.rest.repos.listReleases({
    owner: context.repo.owner,
    repo: context.repo.repo,
  });
  // Search for existing release with the given tag
  const existing_release = releases.find((release) => release.tag_name === tag);
  core.info(
    `Existing release with tag ${tag}: ${existing_release ? "found" : "not found"}`,
  );
  return existing_release ? true : false;
};

export const comment_on_pr = async ({
  github,
  context,
  core,
  version,
  release_exists,
  source_branch = "main",
}) => {
  core.info(`Script fetched from branch ${source_branch}`);
  // List all comments on the PR
  const { data: comments } = await github.rest.issues.listComments({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: context.issue.number,
  });
  // Search for existing bot comment
  const bot_comment = comments.find(
    (comment) =>
      comment.user.type === "Bot" &&
      comment.body.includes("<!-- Release Guard -->"),
  );
  // Prepare the message
  const message = `<!-- Release Guard -->
## Release Guard Report
Version: \`${version}\`
${
  release_exists
    ? "❌ A release with this version already exists on GitHub. Please update the version in `package.json` before merging this PR."
    : "✅ This version is available for release. You can safely merge this PR."
}`;
  core.info(`${message}`);
  core.info("ciao ciao");
  // Delete existing bot comment
  if (bot_comment) {
    await github.rest.issues.deleteComment({
      owner: context.repo.owner,
      repo: context.repo.repo,
      comment_id: bot_comment.id,
    });
  }
  // Create new comment
  await github.rest.issues.createComment({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: context.issue.number,
    body: message,
  });
};
