import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import '@/app/(main)/style.css';

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="grid-main">
        <Navbar />
        <main className='grid-content'>{children}</main>
        <div className="grid-footer"><Footer></Footer></div>
    </div>
    
  );
}