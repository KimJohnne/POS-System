import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  X, 
  Check, 
  ExternalLink, 
  BookOpen, 
  ShieldCheck, 
  Layers, 
  Database, 
  Printer, 
  Copy,
  Info,
  Laptop
} from 'lucide-react';
import { DOCUMENTATION_SECTIONS, DOCUMENTATION_METADATA } from '../data/documentationData';

interface DocumentationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DocumentationModal: React.FC<DocumentationModalProps> = ({ isOpen, onClose }) => {
  const [activeSectionId, setActiveSectionId] = useState<string>('overview');
  const [copiedText, setCopiedText] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);

  if (!isOpen) return null;

  const activeSection = DOCUMENTATION_SECTIONS.find(s => s.id === activeSectionId) || DOCUMENTATION_SECTIONS[0];

  const handleDownload = async (url: string, filename: string, mimeType: string) => {
    setDownloading(filename);
    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Failed to load ${filename}`);
      }
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(new Blob([blob], { type: mimeType }));
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(objectUrl);
        setDownloading(null);
      }, 800);
    } catch {
      // Direct navigation fallback if blob is restricted
      setDownloading(null);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleCopyMarkdown = () => {
    const fullText = `# ${DOCUMENTATION_METADATA.title}
Version: ${DOCUMENTATION_METADATA.version} | ${DOCUMENTATION_METADATA.date}
Author: ${DOCUMENTATION_METADATA.author}

${DOCUMENTATION_SECTIONS.map(s => `## ${s.title}\n\n${s.content}`).join('\n\n---\n\n')}`;

    navigator.clipboard.writeText(fullText).then(() => {
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-5 backdrop-blur-xs overflow-y-auto no-print">
      <div className="w-full max-w-5xl bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl overflow-hidden my-auto text-stone-100 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-stone-800 bg-stone-950/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-white">System Documentation & Manuals</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  {DOCUMENTATION_METADATA.version}
                </span>
              </div>
              <p className="text-xs text-stone-400 truncate max-w-lg">
                Complete technical specifications, database schema, operational SOPs, and installation guides.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Bar: Direct Download & Tools */}
        <div className="p-3.5 sm:p-4 bg-stone-950 border-b border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-stone-300 font-semibold w-full sm:w-auto">
            <Download className="w-4 h-4 text-amber-400" />
            <span>Download Official Documentation:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
            {/* PDF Download Button */}
            <button
              onClick={() => handleDownload('/CELLAR_POS_SOFTWARE_DOCUMENTATION.pdf', 'CELLAR_POS_SOFTWARE_DOCUMENTATION.pdf', 'application/pdf')}
              disabled={downloading !== null}
              className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition active:scale-95 disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{downloading === 'CELLAR_POS_SOFTWARE_DOCUMENTATION.pdf' ? 'Downloading...' : 'PDF (.pdf)'}</span>
            </button>

            {/* Word DOCX Download Button */}
            <button
              onClick={() => handleDownload('/CELLAR_POS_SOFTWARE_DOCUMENTATION.docx', 'CELLAR_POS_SOFTWARE_DOCUMENTATION.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')}
              disabled={downloading !== null}
              className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition active:scale-95 disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{downloading === 'CELLAR_POS_SOFTWARE_DOCUMENTATION.docx' ? 'Downloading...' : 'Word (.docx)'}</span>
            </button>

            {/* Markdown Download Button */}
            <button
              onClick={() => handleDownload('/CELLAR_POS_SOFTWARE_DOCUMENTATION.md', 'CELLAR_POS_SOFTWARE_DOCUMENTATION.md', 'text/markdown')}
              disabled={downloading !== null}
              className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition active:scale-95 disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Markdown (.md)</span>
            </button>

            {/* Copy Full Text Button */}
            <button
              onClick={handleCopyMarkdown}
              className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 text-xs font-semibold flex items-center gap-1.5 transition active:scale-95"
              title="Copy entire manual text to clipboard"
            >
              {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedText ? 'Copied!' : 'Copy Text'}</span>
            </button>

            {/* Print / Save to PDF */}
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 text-xs font-semibold flex items-center gap-1.5 transition active:scale-95"
              title="Print document or save as PDF via system dialog"
            >
              <Printer className="w-3.5 h-3.5 text-stone-400" />
              <span className="hidden md:inline">Print / Save</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-stone-800 bg-stone-900/60 px-4 pt-2 gap-2 overflow-x-auto no-scrollbar shrink-0">
          {DOCUMENTATION_SECTIONS.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSectionId(section.id)}
              className={`pb-2.5 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition ${
                activeSectionId === section.id
                  ? 'border-amber-500 text-amber-400'
                  : 'border-transparent text-stone-400 hover:text-stone-200'
              }`}
            >
              <span>{section.title}</span>
            </button>
          ))}
        </div>

        {/* Content Body: Full In-App Reader */}
        <div className="p-6 overflow-y-auto space-y-6 text-stone-300 leading-relaxed font-sans text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-stone-800">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white mb-0.5">
                {activeSection.title}
              </h2>
              <p className="text-xs text-stone-400">
                {activeSection.summary}
              </p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-800 text-stone-400 border border-stone-700">
              Chapter {DOCUMENTATION_SECTIONS.findIndex(s => s.id === activeSectionId) + 1} of {DOCUMENTATION_SECTIONS.length}
            </span>
          </div>

          {/* Section Main Content */}
          <div className="bg-stone-950 p-5 rounded-2xl border border-stone-800/80 whitespace-pre-wrap font-sans text-xs leading-relaxed text-stone-200">
            {activeSection.content}
          </div>

          {/* Subsections if any */}
          {activeSection.subsections && activeSection.subsections.length > 0 && (
            <div className="space-y-4">
              {activeSection.subsections.map((sub, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-stone-900/80 border border-stone-800 space-y-2">
                  <h4 className="font-bold text-xs text-amber-300">
                    {sub.title}
                  </h4>
                  <div className="text-stone-300 whitespace-pre-wrap leading-relaxed">
                    {sub.body}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Compliance Callout on Compliance Tab */}
          {activeSection.id === 'compliance' && (
            <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-900/50 space-y-2">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Statutory Scope Enforcement</span>
              </div>
              <p className="text-xs text-stone-300 leading-relaxed">
                Cellar POS receipts explicitly feature the watermark notice:
              </p>
              <div className="p-2.5 rounded-lg bg-stone-950 border border-amber-800 font-mono text-[11px] text-amber-300 text-center font-bold">
                *** Internal receipt — not a KRA eTIMS tax invoice ***
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-stone-950 border-t border-stone-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-[11px] text-stone-500 font-mono">
            <span>Doc ID: CPOS-TECH-SPEC-2026-V1</span>
            <span>•</span>
            <span>{DOCUMENTATION_METADATA.date}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const currentIndex = DOCUMENTATION_SECTIONS.findIndex(s => s.id === activeSectionId);
                if (currentIndex > 0) {
                  setActiveSectionId(DOCUMENTATION_SECTIONS[currentIndex - 1].id);
                }
              }}
              disabled={DOCUMENTATION_SECTIONS.findIndex(s => s.id === activeSectionId) === 0}
              className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold disabled:opacity-30 transition"
            >
              Previous
            </button>
            <button
              onClick={() => {
                const currentIndex = DOCUMENTATION_SECTIONS.findIndex(s => s.id === activeSectionId);
                if (currentIndex < DOCUMENTATION_SECTIONS.length - 1) {
                  setActiveSectionId(DOCUMENTATION_SECTIONS[currentIndex + 1].id);
                }
              }}
              disabled={DOCUMENTATION_SECTIONS.findIndex(s => s.id === activeSectionId) === DOCUMENTATION_SECTIONS.length - 1}
              className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold disabled:opacity-30 transition"
            >
              Next
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition"
            >
              Close Manual
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
