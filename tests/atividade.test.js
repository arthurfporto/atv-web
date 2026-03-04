const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// ─── Utilitários ────────────────────────────────────────────────────────────

function getChangedFiles() {
  try {
    const output = execSync("git diff --name-only --diff-filter=AM origin/main...HEAD")
      .toString()
      .trim();
    return output ? output.split("\n") : [];
  } catch {
    // fallback local: lista tudo na raiz (exceto pastas de config)
    return fs.readdirSync(".").filter((f) => fs.statSync(f).isFile());
  }
}

function readIndexHtml() {
  const filePath = path.resolve("index.html");
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, "utf-8");
}

// Simula o DOM usando jsdom
function parseHtml(html) {
  const { JSDOM } = require("jsdom");
  return new JSDOM(html);
}

// ─── Setup ──────────────────────────────────────────────────────────────────

const changedFiles = getChangedFiles();
const html = readIndexHtml();
const dom = html ? parseHtml(html) : null;
const document = dom?.window.document ?? null;

// ─── Testes ─────────────────────────────────────────────────────────────────

describe("📁 Arquivos do PR", () => {
  test("Apenas um arquivo foi enviado", () => {
    expect(changedFiles).toHaveLength(1);
  });

  test("O arquivo enviado é o index.html", () => {
    expect(changedFiles[0]).toBe("index.html");
  });
});

describe("🏗️ Estrutura básica do HTML", () => {
  test("O arquivo index.html existe", () => {
    expect(html).not.toBeNull();
  });

  test("Contém DOCTYPE html", () => {
    expect(html.toLowerCase()).toContain("<!doctype html>");
  });

  test("Contém a tag <html>", () => {
    const el = document.querySelector("html");
    expect(el).not.toBeNull();
  });

  test("Contém a tag <head>", () => {
    const el = document.querySelector("head");
    expect(el).not.toBeNull();
  });

  test("Contém a tag <body>", () => {
    const el = document.querySelector("body");
    expect(el).not.toBeNull();
  });
});

describe("✏️ Conteúdo do <body>", () => {
  test("Existe uma tag <h1> dentro do <body>", () => {
    const h1 = document.querySelector("body h1");
    expect(h1).not.toBeNull();
  });

  test("A tag <h1> não está vazia", () => {
    const h1 = document.querySelector("body h1");
    expect(h1?.textContent.trim().length).toBeGreaterThan(0);
  });
});