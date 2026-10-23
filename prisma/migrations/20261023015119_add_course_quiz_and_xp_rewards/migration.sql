-- AlterTable
ALTER TABLE "courses" ADD COLUMN     "hasFinalQuiz" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "quiz_questions" ADD COLUMN     "courseId" TEXT,
ADD COLUMN     "explanation" TEXT NOT NULL DEFAULT '',
ALTER COLUMN "lessonId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "xp_rewards" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rewardKey" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "xp_rewards_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "xp_rewards_userId_idx" ON "xp_rewards"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "xp_rewards_userId_rewardKey_key" ON "xp_rewards"("userId", "rewardKey");

-- CreateIndex
CREATE INDEX "quiz_questions_courseId_idx" ON "quiz_questions"("courseId");

-- AddForeignKey
ALTER TABLE "quiz_questions" ADD CONSTRAINT "quiz_questions_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "xp_rewards" ADD CONSTRAINT "xp_rewards_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
