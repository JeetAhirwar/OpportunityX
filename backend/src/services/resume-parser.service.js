const fs = require("fs/promises");
const path = require("path");
const { PDFParse } = require("pdf-parse");
const mammoth = require("mammoth");
const { sanitizeText } = require("./ai.service");

const MAX_RAW_TEXT = 12000;
const COMMON_TECH = [
  "javascript", "typescript", "react", "node.js", "node", "express", "mongodb",
  "mongoose", "next.js", "vue", "angular", "python", "java", "spring", "aws",
  "azure", "gcp", "docker", "kubernetes", "sql", "postgresql", "mysql", "redis",
  "graphql", "rest", "tailwind", "redux", "git", "ci/cd", "linux",
];

const sectionPatterns = {
  summary: /(?:summary|profile|objective)\s*[:\n]([\s\S]*?)(?=\n\s*(?:skills|education|experience|projects|certifications|links)\b|$)/i,
  skills: /(?:skills|technical skills|core skills)\s*[:\n]([\s\S]*?)(?=\n\s*(?:education|experience|projects|certifications|summary|links)\b|$)/i,
  education: /(?:education|academics)\s*[:\n]([\s\S]*?)(?=\n\s*(?:skills|experience|projects|certifications|summary|links)\b|$)/i,
  experience: /(?:experience|work experience|employment)\s*[:\n]([\s\S]*?)(?=\n\s*(?:skills|education|projects|certifications|summary|links)\b|$)/i,
  projects: /(?:projects|portfolio)\s*[:\n]([\s\S]*?)(?=\n\s*(?:skills|education|experience|certifications|summary|links)\b|$)/i,
  certifications: /(?:certifications|certificates)\s*[:\n]([\s\S]*?)(?=\n\s*(?:skills|education|experience|projects|summary|links)\b|$)/i,
};

const normalizeWhitespace = (text) => String(text || "").replace(/\r/g, "\n").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();

const splitList = (text) =>
  normalizeWhitespace(text)
    .split(/\n|,|;|•|·|\|/)
    .map((item) => item.replace(/^[-*]\s*/, "").trim())
    .filter((item) => item.length > 1)
    .slice(0, 80);

const extractSection = (text, key) => {
  const match = text.match(sectionPatterns[key]);
  return match ? normalizeWhitespace(match[1]).slice(0, 2500) : "";
};

const extractName = (text) => {
  const firstLines = normalizeWhitespace(text).split("\n").map((line) => line.trim()).filter(Boolean).slice(0, 6);
  const candidate = firstLines.find((line) => /^[A-Za-z][A-Za-z .'-]{2,80}$/.test(line) && !/@|resume|curriculum/i.test(line));
  return candidate || "";
};

const extractEmail = (text) => text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || "";

const extractPhone = (text) => text.match(/(?:\+?\d[\d\s().-]{7,}\d)/)?.[0]?.replace(/\s+/g, " ").trim() || "";

const extractLinks = (text) => [...new Set(text.match(/https?:\/\/[^\s)]+|(?:linkedin\.com|github\.com|gitlab\.com|bitbucket\.org|[\w.-]+\.(?:dev|io|me|com)\/[^\s)]+)/gi) || [])].slice(0, 20);

const extractYears = (text) => {
  const explicit = [...text.matchAll(/(\d+(?:\.\d+)?)\+?\s*(?:years|yrs)\s+(?:of\s+)?experience/gi)].map((match) => Number(match[1]));
  if (explicit.length) return Math.max(...explicit);
  const years = [...text.matchAll(/\b(20\d{2}|19\d{2})\b/g)].map((match) => Number(match[1])).filter((year) => year <= new Date().getFullYear());
  if (years.length >= 2) return Math.max(0, Math.min(40, new Date().getFullYear() - Math.min(...years)));
  return 0;
};

const extractTechStack = (text) => {
  const lower = text.toLowerCase();
  return COMMON_TECH.filter((skill) => lower.includes(skill)).map((skill) => (skill === "node" ? "Node.js" : skill));
};

const extractSkills = (text) => {
  const sectionSkills = splitList(extractSection(text, "skills"));
  const tech = extractTechStack(text);
  return [...new Set([...sectionSkills, ...tech].map((skill) => skill.trim()).filter(Boolean))].slice(0, 80);
};

const parsePdf = async (buffer) => {
  const pdf = new PDFParse(new Uint8Array(buffer));
  const result = await pdf.getText();
  return result.text || "";
};

const parseDocx = async (filePath) => {
  const result = await mammoth.extractRawText({ path: filePath });
  return result.value || "";
};

const parseDocxBuffer = async (buffer) => {
  const result = await mammoth.extractRawText({ buffer });
  return result.value || "";
};

const extractTextFromFile = async ({ filePath, buffer, mimeType = "" }) => {
  if (buffer) {
    if (mimeType === "application/pdf") return parsePdf(buffer);
    if (mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") return parseDocxBuffer(buffer);
    throw new Error("Unsupported resume file type");
  }
  const extension = path.extname(filePath).toLowerCase();
  if (mimeType === "application/pdf" || extension === ".pdf") return parsePdf(await fs.readFile(filePath));
  if (mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || extension === ".docx") return parseDocx(filePath);
  throw new Error("Unsupported resume file type");
};

const parseResumeFile = async ({ filePath, buffer, mimeType }) => {
  const rawText = sanitizeText(normalizeWhitespace(await extractTextFromFile({ filePath, buffer, mimeType })), MAX_RAW_TEXT);
  const parsedData = {
    name: extractName(rawText),
    email: extractEmail(rawText),
    phone: extractPhone(rawText),
    skills: extractSkills(rawText),
    education: splitList(extractSection(rawText, "education")).slice(0, 20),
    experience: splitList(extractSection(rawText, "experience")).slice(0, 30),
    projects: splitList(extractSection(rawText, "projects")).slice(0, 20),
    certifications: splitList(extractSection(rawText, "certifications")).slice(0, 20),
    summary: extractSection(rawText, "summary"),
    links: extractLinks(rawText),
    yearsOfExperience: extractYears(rawText),
    techStack: extractTechStack(rawText),
  };
  return { rawText, parsedData };
};

module.exports = {
  MAX_RAW_TEXT,
  parseResumeFile,
};
