import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'Memory Noir — The Case of Us',description:'Some mysteries are better solved together. An atmospheric cooperative game about the things we remember.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
