/*
  Warnings:

  - A unique constraint covering the columns `[fullName]` on the table `repository` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "pull_request_githubId_idx";

-- DropIndex
DROP INDEX "pull_request_repositoryId_idx";

-- DropIndex
DROP INDEX "repository_fullName_idx";

-- DropIndex
DROP INDEX "repository_githubId_idx";

-- CreateIndex
CREATE INDEX "pull_request_repositoryId_number_idx" ON "pull_request"("repositoryId", "number");

-- CreateIndex
CREATE INDEX "pull_request_author_idx" ON "pull_request"("author");

-- CreateIndex
CREATE UNIQUE INDEX "repository_fullName_key" ON "repository"("fullName");

-- CreateIndex
CREATE INDEX "repository_owner_idx" ON "repository"("owner");
