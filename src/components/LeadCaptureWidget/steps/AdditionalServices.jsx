import React from 'react';
import { Package, Shield, Wrench } from 'lucide-react';
import { useLeadStore } from '../../../storage/leadStore';

export function AdditionalServices() {
  const { formData, addAdditionalService, removeAdditionalService, nextStep } = useLeadStore();
  
  const services = [
    {
      id: 'packing',
      name: 'Packing Services',
      description: 'Professional packing of your belongings',
      icon: <Package className="w-5 h-5" />
    },
    {
      id: 'insurance',
      name: 'Moving Insurance',
      description: 'Additional protection for your items',
      icon: <Shield className="w-5 h-5" />
    },
    {
      id: 'disassembly',
      name: 'Furniture Disassembly',
      description: 'Take apart and reassemble furniture',
      icon: <Wrench className="w-5 h-5" />
    }
  ];
  
  const isServiceSelected = (serviceId) => {
    return formData.additionalServices.some(s => s.id === serviceId);
  };
  
  const toggleService = (service) => {
    if (isServiceSelected(service.id)) {
      removeAdditionalService(service.id);
    } else {
      // Only pass serializable data to the store (no React elements)
      const serializableService = {
        id: service.id,
        name: service.name,
        description: service.description
      };
      addAdditionalService(serializableService);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-md font-semibold text-foreground mb-2">
          Any additional services?
        </h2>
        <p className="text-muted-foreground">
          Select any additional services you might need
        </p>
      </div>
      
      <div className="space-y-3">
        {services.map((service) => (
          <button
            key={service.id}
            onClick={() => toggleService(service)}
            className={`
              w-full p-4 rounded-lg border-2 transition-all duration-200 text-left
              ${isServiceSelected(service.id)
                ? 'border-primary bg-primary/10'
                : 'border-border hover:border-primary/50 hover:bg-primary/5'
              }
            `}
          >
            <div className="flex items-center gap-3">
              <div className={`
                p-2 rounded-lg
                ${isServiceSelected(service.id)
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
                }
              `}>
                {service.icon}
              </div>
              <div>
                <h3 className="font-medium text-foreground">{service.name}</h3>
                <p className="text-sm text-muted-foreground">{service.description}</p>
              </div>
              <div className="ml-auto">
                <div className={`
                  w-5 h-5 rounded border-2 flex items-center justify-center
                  ${isServiceSelected(service.id)
                    ? 'border-primary bg-primary'
                    : 'border-border'
                  }
                `}>
                  {isServiceSelected(service.id) && (
                    <div className="w-2 h-2 bg-primary-foreground rounded-full" />
                  )}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
      
      <button
        onClick={nextStep}
        className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
      >
        Continue
      </button>
    </div>
  );
}