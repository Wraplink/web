export default function ThemeBackground() {
    return (
        <>
            <div className="fixed inset-0 -z-50 bg-[#070B18]" />

            <div className="fixed inset-0 -z-40 overflow-hidden">

                <div className="absolute -start-40 top-10 h-96 w-96 rounded-full bg-cyan-500/15 blur-3xl animate-pulse" />

                <div className="absolute end-0 top-60 h-[28rem] w-[28rem] rounded-full bg-purple-600/15 blur-3xl animate-pulse" />

                <div className="absolute bottom-10 start-1/3 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl animate-pulse" />

            </div>

            <div className="fixed inset-0 -z-30 bg-[linear-gradient(rgba(255,255,255,.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.5)_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.05]" />
        </>
    );
}