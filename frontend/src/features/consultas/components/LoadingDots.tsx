export function LoadingDots() {
    return (
        <div className="flex items-center gap-1">
            <div 
                className="h-1 w-1 rounded-full bg-current animate-bounce" 
                style={{ animationDelay: '0ms', animationDuration: '1s' }}
            />
            <div 
                className="h-1  w-1 rounded-full bg-current animate-bounce" 
                style={{ animationDelay: '150ms', animationDuration: '1s' }}
            />
            <div 
                className="h-1 w-1 rounded-full bg-current animate-bounce" 
                style={{ animationDelay: '300ms', animationDuration: '1s' }}
            />
        </div>
    );
}
