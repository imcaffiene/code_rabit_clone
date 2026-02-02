-- AlterTable
ALTER TABLE "comment" ALTER COLUMN "githubCommentId" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "pull_request" ALTER COLUMN "githubId" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "repository" ALTER COLUMN "githubId" SET DATA TYPE BIGINT;
