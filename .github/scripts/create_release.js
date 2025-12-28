module.exports = async ({ github, context, core }) => {
  await github.rest.repos.createRelease({
    owner: context.repo.owner,
    repo: context.repo.repo,
    tag_name: process.env.TAG,
    name: process.env.TAG,
    generate_release_notes: true,
  });
};
