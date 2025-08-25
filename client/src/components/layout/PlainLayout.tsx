
import React from 'react';

interface PlainLayoutProps {
  children: React.ReactNode;
}

const PlainLayout: React.FC<PlainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="p-6">
        {children}
      </main>
    </div>
  );
};

export default PlainLayout;
