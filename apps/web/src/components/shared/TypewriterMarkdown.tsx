import { useState, useEffect, memo } from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Props {
    content: string;
    animate: boolean;
    onTyping?: () => void;
}

const remarkPlugins = [remarkGfm];

const TypewriterMarkdown = memo(({ content, animate, onTyping }: Props) => {
    const [displayedContent, setDisplayedContent] = useState(animate ? "" : content);
    
    useEffect(() => {
        if (!animate) {
            setDisplayedContent(content);
            return;
        }
        
        let i = 0;
        setDisplayedContent("");
        const interval = setInterval(() => {
            i += 4;
            if (i >= content.length) {
                setDisplayedContent(content);
                clearInterval(interval);
            } else {
                setDisplayedContent(content.slice(0, i));
            }
            if (onTyping) onTyping();
        }, 15);

        return () => clearInterval(interval);
    }, [content, animate]);

    return (
         <ReactMarkdown remarkPlugins={remarkPlugins}>
            {displayedContent}
        </ReactMarkdown>
    );
});

TypewriterMarkdown.displayName = "TypewriterMarkdown";

export default TypewriterMarkdown;
