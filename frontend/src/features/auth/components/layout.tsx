export default function AuthLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="">
            <div className="flex min-h-screen flex-col items-center justify-center px-4">
                <div className="w-full max-w-[550px]">{children}</div>
            </div>
        </div>
    );
}
