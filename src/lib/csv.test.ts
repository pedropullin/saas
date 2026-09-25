import { describe, expect, it } from "vitest";
import { parseCsv, toCsv } from "./csv";

describe("toCsv", () => {
  it("escapa aspas, vírgulas e quebras de linha", () => {
    expect(toCsv([["a", 'b "c"', "d,e", "f\ng", null, 3]])).toBe('a,"b ""c""","d,e","f\ng",,3');
  });

  it("neutraliza fórmulas", () => {
    expect(toCsv([["=HYPERLINK(1)", "+55 11 9999"]])).toBe("'=HYPERLINK(1),'+55 11 9999");
  });
});

describe("parseCsv", () => {
  it("lê aspas, quebras de linha e detecta ponto e vírgula", () => {
    expect(parseCsv('Empresa;Telefone\r\n"Bar ""do Zé""";"+55 11"\n"Linha\nquebrada";x\n')).toEqual([
      ["Empresa", "Telefone"],
      ['Bar "do Zé"', "+55 11"],
      ["Linha\nquebrada", "x"],
    ]);
    expect(parseCsv("a,b\n1,2")).toEqual([["a", "b"], ["1", "2"]]);
  });
});
