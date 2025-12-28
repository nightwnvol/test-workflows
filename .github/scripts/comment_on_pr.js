module.exports = async ({ github, context, core }) => {
  const version = process.env.VERSION;
  const exists = process.env.EXISTS === "true";

  // Search for existing bot comment
  const { data: comments } = await github.rest.issues.listComments({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: context.issue.number,
  });

  const botComment = comments.find(
    (comment) =>
      comment.user.type === "Bot" &&
      comment.body.includes("## Release Version Check")
  );

  const message = `
            ## Release Version Check

            **Version in package.json:** \`${version}\`

            ${
              exists
                ? "❌ **ERROR:** A release with this version already exists on GitHub!"
                : "✅ **SUCCESS:** This version is available for release."
            }

            ${
              exists
                ? "**Action required:** Please update the version in package.json before merging."
                : "You can safely merge this release."
            }
            `;

  if (botComment) {
    // Delete existing comment
    await github.rest.issues.deleteComment({
      owner: context.repo.owner,
      repo: context.repo.repo,
      comment_id: botComment.id,
    });
  }
  // Create new comment
  await github.rest.issues.createComment({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: context.issue.number,
    body: message,
  });

  // Fail if the release already exists
  if (exists) {
    core.setFailed(`Version ${version} already exists in releases`);
  }
};
