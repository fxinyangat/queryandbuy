// Simple markdown parser for chat messages
export const parseMarkdown = (text) => {
    if (!text) return '';
    
    // Convert **text** to <strong>text</strong>
    let parsed = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Convert *text* to <em>text</em>
    parsed = parsed.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Convert bullet points to proper lists
    parsed = parsed.replace(/^•\s+(.*)$/gm, '<li>$1</li>');
    parsed = parsed.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
    
    // Convert line breaks to <br> tags
    parsed = parsed.replace(/\n/g, '<br>');
    
    return parsed;
}; 