-- CreateTable
CREATE TABLE "Ukol" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nazev" TEXT NOT NULL,
    "popis" TEXT,
    "stav" TEXT NOT NULL DEFAULT 'novy',
    "lokace" TEXT NOT NULL DEFAULT 'kdekoliv',
    "zdroj" TEXT NOT NULL DEFAULT 'rucni',
    "zdrojId" TEXT,
    "schvaleno" BOOLEAN NOT NULL DEFAULT true,
    "priorita" TEXT NOT NULL DEFAULT 'normalni',
    "deadline" DATETIME,
    "vytvoreno" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "aktualizovano" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "NavrhUkolu" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nazev" TEXT NOT NULL,
    "popis" TEXT,
    "lokace" TEXT NOT NULL DEFAULT 'kdekoliv',
    "zdroj" TEXT NOT NULL,
    "zdrojId" TEXT,
    "vytvoreno" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "SyncLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "cas" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "typ" TEXT NOT NULL,
    "vysledek" TEXT NOT NULL,
    "zprava" TEXT,
    "noveNavrhy" INTEGER NOT NULL DEFAULT 0
);
