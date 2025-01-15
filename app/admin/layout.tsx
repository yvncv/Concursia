"use client"
import React from 'react'
import AdminSideBar from './adminSideBar/AdminSideBar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className='bg-black/60'>
            <AdminSideBar />
            <div className="flex-1 p-6 min-h-screen bg-gray-100 overflow-y-auto md:ml-64">
                {children}
            </div>
        </div>
    );
}
