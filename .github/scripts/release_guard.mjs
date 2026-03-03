export const check_release = async ({ github, context, core, tag }) => {
  // Fetch all releases from the repository
  const { data: releases } = await github.rest.repos.listReleases({
    owner: context.repo.owner,
    repo: context.repo.repo,
  });

  // Check if a release with the given tag already exists
  const existing_release = releases.find((release) => release.tag_name === tag);
  core.info(`Checking for existing release with tag: ${tag}`);
  core.info(`Existing release found: ${existing_release ? "Yes" : "No"}`);

  return existing_release ? true : false;
};

export const comment_on_pr = async ({
  github,
  context,
  core,
  version,
  release_exists,
}) => {
  // Sanitize version to prevent markdown injection
  const sanitized_version = version.replace(/[`<>]/g, "");
  core.info(`Sanitized version for comment: ${sanitized_version}`);
  core.info(`Release exists: ${release_exists}`);

  // Fetch all comments on the PR
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

  const message = `<!-- Release Guard -->
## Release Guard Report
Version: \`${version}\`
${
  release_exists
    ? "❌ A release with this version already exists on GitHub. Please update the version in `package.json` before merging this PR."
    : "✅ This version is available for release. You can safely merge this PR."
}`;

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
