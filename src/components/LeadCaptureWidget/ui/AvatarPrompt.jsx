import React from 'react';
import { User } from 'lucide-react';

export function AvatarPrompt({ message }) {
  return (
    <div className="flex items-center space-x-4 mb-6">
      <div className="flex-shrink-0 w-12 h-12 bg-primary rounded-full flex items-center justify-center">
        <User className="w-6 h-6 text-primary-foreground" />
      </div>
      
      <div className="bg-muted rounded-lg px-4 py-2 relative">
        <p className="text-foreground font-medium">
          {message}
        </p>
        
        {/* Speech bubble tail */}
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-2">
          <div className="w-0 h-0 border-t-[8px] border-t-transparent border-r-[8px] border-r-muted border-b-[8px] border-b-transparent"></div>
        </div>
      </div>
    </div>
  );
}