export default function AuthLayout({ 
    children, 
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
            <div className="w-full max-w-[450px]">
                {children}
            </div>
        </div>
    )
}