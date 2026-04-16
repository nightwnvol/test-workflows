export const check_release = async ({ github, context, core, tag }) => {
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
