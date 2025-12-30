export default async ({ github, context, core }) => {
  const { data: releases } = await github.rest.repos.listReleases({
    owner: context.repo.owner,
    repo: context.repo.repo,
  });

  const currentVersion = process.env.VERSION;
  const existingRelease = releases.find(
    (r) => r.tag_name === `v${currentVersion}` || r.tag_name === currentVersion
  );

  return existingRelease ? true : false;
};
