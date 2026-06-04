-- CreateTable
CREATE TABLE "Ukol" (
    "id" SERIAL NOT NULL,
    "nazev" TEXT NOT NULL,
    "popis" TEXT,
    "stav" TEXT NOT NULL DEFAULT 'novy',
    "lokace" TEXT NOT NULL DEFAULT 'kdekoliv',
    "zdroj" TEXT NOT NULL DEFAULT 'rucni',
    "zdrojId" TEXT,
    "schvaleno" BOOLEAN NOT NULL DEFAULT true,
    "priorita" TEXT NOT NULL DEFAULT 'normalni',
    "deadline" TIMESTAMP(3),
    "vytvoreno" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "aktualizovano" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ukol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NavrhUkolu" (
    "id" SERIAL NOT NULL,
    "nazev" TEXT NOT NULL,
    "popis" TEXT,
    "lokace" TEXT NOT NULL DEFAULT 'kdekoliv',
    "zdroj" TEXT NOT NULL,
    "zdrojId" TEXT,
    "vytvoreno" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NavrhUkolu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SyncLog" (
    "id" SERIAL NOT NULL,
    "cas" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "typ" TEXT NOT NULL,
    "vysledek" TEXT NOT NULL,
    "zprava" TEXT,
    "noveNavrhy" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SyncLog_pkey" PRIMARY KEY ("id")
);
