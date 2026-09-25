import { describe, expect, it } from "vitest";
import { toCsv } from "./csv";

describe("toCsv", () => {
  it("escapa aspas, vírgulas e quebras de linha", () => {
    expect(toCsv([["a", 'b "c"', "d,e", "f\ng", null, 3]])).toBe('a,"b ""c""","d,e","f\ng",,3');
  });

  it("neutraliza fórmulas", () => {
    expect(toCsv([["=HYPERLINK(1)", "+55 11 9999"]])).toBe("'=HYPERLINK(1),'+55 11 9999");
  });
});
