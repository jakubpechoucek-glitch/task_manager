export type Stav = "novy" | "v_reseni" | "cekam" | "blokovano" | "hotovo";
export type Lokace = "praha" | "manila" | "kdekoliv";
export type Priorita = "nizka" | "normalni" | "vysoka";
export type Zdroj = "rucni" | "gmail" | "kalendar";

export interface Ukol {
  id: number;
  nazev: string;
  popis: string | null;
  stav: Stav;
  lokace: Lokace;
  zdroj: Zdroj;
  zdrojId: string | null;
  schvaleno: boolean;
  priorita: Priorita;
  deadline: string | null;
  vytvoreno: string;
  aktualizovano: string;
}

export interface NavrhUkolu {
  id: number;
  nazev: string;
  popis: string | null;
  lokace: Lokace;
  stav: Stav;
  zdroj: Zdroj;
  zdrojId: string | null;
  vytvoreno: string;
}
