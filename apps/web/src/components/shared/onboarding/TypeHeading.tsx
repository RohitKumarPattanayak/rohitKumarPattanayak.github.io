import { useEffect, useState, memo } from "react";

const TypingHeading = memo(({ fullText, isActiveResumeLoading, isTypingComplete, setIsTypingComplete }: { fullText: string, isActiveResumeLoading: boolean, isTypingComplete: boolean, setIsTypingComplete: (complete: boolean) => void }) => {
    const [typedText, setTypedText] = useState("")

    useEffect(() => {
        if (isActiveResumeLoading) return;

        setTypedText("")
        setIsTypingComplete(false)

        let currentIndex = 0
        const intervalId = setInterval(() => {
            if (currentIndex <= fullText.length) {
                setTypedText(fullText.slice(0, currentIndex))
                currentIndex++
            } else {
                setIsTypingComplete(true)
                clearInterval(intervalId)
            }
        }, 45) // Adjust typing speed here (lower is faster)

        return () => clearInterval(intervalId)
    }, [fullText, isActiveResumeLoading, setIsTypingComplete])

    return (
        <div className="relative w-full mb-2 min-h-[32px]">
            {/* Invisible placeholder pre-allocates exact final layout bounds, preventing expensive DOM reflows when text grows */}
            <h2 className="text-2xl font-bold tracking-tight invisible pointer-events-none select-none" aria-hidden="true">
                {fullText}
                <span>|</span>
            </h2>
            <h2 className="absolute top-0 left-0 w-full h-full text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                {typedText}
                {!isTypingComplete && <span className="animate-pulse">|</span>}
            </h2>
        </div>
    )
})

export default TypingHeading;