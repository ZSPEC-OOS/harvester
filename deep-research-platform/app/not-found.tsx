import Link from "next/link";
export default function NotFound() { return <main className="min-h-screen flex items-center justify-center"><div className="text-center space-y-3"><h1 className="text-4xl font-bold">404</h1><p>Page not found.</p><Link className="underline" href="/">Back to home</Link></div></main>; }
