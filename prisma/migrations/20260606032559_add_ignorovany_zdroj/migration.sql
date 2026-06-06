-- CreateTable
CREATE TABLE "IgnorovanyZdroj" (
    "id" SERIAL NOT NULL,
    "zdrojId" TEXT NOT NULL,
    "zdroj" TEXT NOT NULL,
    "vytvoreno" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IgnorovanyZdroj_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IgnorovanyZdroj_zdrojId_key" ON "IgnorovanyZdroj"("zdrojId");
