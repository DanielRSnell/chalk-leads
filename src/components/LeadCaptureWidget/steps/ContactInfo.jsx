import React, { useState, useEffect } from 'react';
import { User, Mail, Phone } from 'lucide-react';
import { useLeadStore } from '../../../storage/leadStore';

export function ContactInfo() {
  const { formData, updateContactInfo, nextStep, errors, validateCurrentStep } = useLeadStore();
  const [contact, setContact] = useState(formData.contact);
  
  const handleInputChange = (field, value) => {
    const updatedContact = { ...contact, [field]: value };
    setContact(updatedContact);
    updateContactInfo(updatedContact);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateCurrentStep()) {
      nextStep();
    }
  };

  // Expose navigation functions to StepNavigation
  useEffect(() => {
    window.contactInfoNavigation = {
      handleContinue: () => {
        nextStep();
      },
      canSkip: false,
      buttonText: 'Continue'
    };
    
    return () => {
      delete window.contactInfoNavigation;
    };
  }, [nextStep]);
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-md font-semibold text-foreground mb-2">
          How can we reach you?
        </h2>
        <p className="text-muted-foreground">
          We'll use this information to provide your quote
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              First Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={contact.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                placeholder="John"
                className={`
                  w-full pl-10 pr-4 py-2 border rounded-lg transition-colors
                  ${errors.firstName
                    ? 'border-destructive focus:border-destructive'
                    : 'border-input focus:border-primary'
                  }
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary
                `}
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-destructive">{errors.firstName}</p>
              )}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Last Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={contact.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                placeholder="Smith"
                className={`
                  w-full pl-10 pr-4 py-2 border rounded-lg transition-colors
                  ${errors.lastName
                    ? 'border-destructive focus:border-destructive'
                    : 'border-input focus:border-primary'
                  }
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary
                `}
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-destructive">{errors.lastName}</p>
              )}
            </div>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <input
              type="email"
              value={contact.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="john@example.com"
              className={`
                w-full pl-10 pr-4 py-2 border rounded-lg transition-colors
                ${errors.email
                  ? 'border-destructive focus:border-destructive'
                  : 'border-input focus:border-primary'
                }
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary
              `}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-destructive">{errors.email}</p>
            )}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Phone
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <input
              type="tel"
              value={contact.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="(555) 123-4567"
              className={`
                w-full pl-10 pr-4 py-2 border rounded-lg transition-colors
                ${errors.phone
                  ? 'border-destructive focus:border-destructive'
                  : 'border-input focus:border-primary'
                }
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary
              `}
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-destructive">{errors.phone}</p>
            )}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Preferred contact method
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="phone"
                checked={contact.preferredContact === 'phone'}
                onChange={(e) => handleInputChange('preferredContact', e.target.value)}
                className="mr-2"
              />
              Phone
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="email"
                checked={contact.preferredContact === 'email'}
                onChange={(e) => handleInputChange('preferredContact', e.target.value)}
                className="mr-2"
              />
              Email
            </label>
          </div>
        </div>
      </form>
    </div>
  );
}