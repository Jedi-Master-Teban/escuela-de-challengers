// MarkdownRenderer - Renders markdown content with Hextech styling
// Simple markdown parser for lesson content

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  // Parse markdown to HTML-like structure
  const parseMarkdown = (md: string): string => {
    let html = md
      // Escape HTML but preserve our markdown
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      // Headers
      .replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold text-hextech-gold mt-6 mb-2">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-hextech-gold mt-8 mb-3 border-b border-hextech-gold/20 pb-2">$1</h2>')
      .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold text-hextech-gold mt-6 mb-4">$1</h1>')
      // Bold and italic
      .replace(/\*\*\*(.+?)\*\*\*/g, '<strong class="text-hextech-gold"><em>$1</em></strong>')
      .replace(/\*\*(.+?)\*\*/g, '<strong class="text-hextech-gold">$1</strong>')
      .replace(/\*(.+?)\*/g, '<em class="text-amber-300">$1</em>')
      // Inline code
      .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 bg-hextech-blue/50 text-hextech-cyan rounded text-sm font-mono">$1</code>')
      // Lists - unordered
      .replace(/^\* (.+)$/gm, '<li class="ml-4 text-gray-300 before:content-[\'•\'] before:text-hextech-gold before:mr-2">$1</li>')
      .replace(/^- (.+)$/gm, '<li class="ml-4 text-gray-300 before:content-[\'•\'] before:text-hextech-gold before:mr-2">$1</li>')
      // Lists - ordered (simple)
      .replace(/^\d+\.\s+(.+)$/gm, '<li class="ml-4 text-gray-300 list-decimal list-inside">$1</li>')
      // Blockquotes / tips
      .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-hextech-gold pl-4 my-4 text-gray-400 italic">$1</blockquote>')
      // Horizontal rules
      .replace(/^---$/gm, '<hr class="border-hextech-gold/20 my-6" />')
      // Line breaks - preserve double newlines as paragraphs
      .replace(/\n\n/g, '</p><p class="text-gray-300 mb-4">')
      // Single newlines within paragraphs
      .replace(/\n/g, '<br />');
    
    // Wrap in paragraph if not already a block element
    if (!html.startsWith('<h') && !html.startsWith('<ul') && !html.startsWith('<ol')) {
      html = '<p class="text-gray-300 mb-4">' + html + '</p>';
    }
    
    return html;
  };

  // Process escaped newlines from JSON
  const processedContent = content
    .replace(/\\n/g, '\n')
    .replace(/\\"/g, '"');

  return (
    <div 
      className={`prose prose-invert max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: parseMarkdown(processedContent) }}
    />
  );
}
