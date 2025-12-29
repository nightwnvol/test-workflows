module.exports = async ({ github, context, core }) => {
  await github.rest.repos.createRelease({
    owner: context.repo.owner,
    repo: context.repo.repo,
    tag_name: process.env.TAG,
    name: process.env.TAG,
    target_commitish: process.env.COMMIT_SHA,
    generate_release_notes: true,
  });
};
