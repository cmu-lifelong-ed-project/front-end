import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
// @ts-ignore
import "./style.css"
/* No additional code is needed here. You can leave $PLACEHOLDER$ empty or remove it. */
export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="grid-main">
        <Navbar />
        <main className='grid-content'>{children}</main>
        {/* <div className="grid-footer"><Footer></Footer></div> */}
    </div>
    
    
  );
}