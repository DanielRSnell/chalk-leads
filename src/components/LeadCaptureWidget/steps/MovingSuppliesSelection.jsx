import React, { useState, useEffect } from 'react';
import { Package, Plus, Minus, ArrowRight } from 'lucide-react';
import { useLeadStore } from '../../../storage/leadStore';
import suppliesData from '../../../data/supplies/categories.json';

// Icon mapping for supplies
const SUPPLY_ICONS = {
  Package, Plus, Minus, ArrowRight,
  Shield: Package, // Fallback
  Home: Package, // Fallback
  Star: Package, // Fallback
  Archive: Package,
  Wrench: Package,
  File: Package,
  Edit: Package,
  Square: Package,
  RotateCcw: Package,
  Utensils: Package,
  Frame: Package,
  Monitor: Package
};

export function MovingSuppliesSelection() {
  const { formData, updateFormData, nextStep } = useLeadStore();
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [selectedSupplies, setSelectedSupplies] = useState(formData.movingSupplies || {});
  
  const categories = suppliesData.categories.sort((a, b) => a.order - b.order);
  const currentCategory = categories[currentCategoryIndex];
  const isLastCategory = currentCategoryIndex === categories.length - 1;

  // Update quantities in local state
  const handleQuantityChange = (productId, quantity) => {
    const newQuantity = Math.max(0, quantity);
    setSelectedSupplies(prev => ({
      ...prev,
      [productId]: {
        ...currentCategory.products.find(p => p.id === productId),
        quantity: newQuantity
      }
    }));
  };

  // Move to next category or finish (called by fixed footer)
  useEffect(() => {
    // Expose navigation functions to parent component via store
    window.movingSuppliesNavigation = {
      handleContinue: () => {
        if (isLastCategory) {
          // Save all supplies to form data and proceed
          updateFormData('movingSupplies', selectedSupplies);
          nextStep();
        } else {
          setCurrentCategoryIndex(currentCategoryIndex + 1);
        }
      },
      handleSkip: () => {
        if (isLastCategory) {
          updateFormData('movingSupplies', selectedSupplies);
          nextStep();
        } else {
          setCurrentCategoryIndex(currentCategoryIndex + 1);
        }
      },
      canSkip: true,
      buttonText: isLastCategory ? 'Complete Selection' : 'Next Category'
    };
    
    return () => {
      delete window.movingSuppliesNavigation;
    };
  }, [currentCategoryIndex, isLastCategory, selectedSupplies, updateFormData, nextStep]);

  const getTotalItemsInCategory = () => {
    return currentCategory.products.reduce((total, product) => {
      return total + (selectedSupplies[product.id]?.quantity || 0);
    }, 0);
  };

  const IconComponent = SUPPLY_ICONS[currentCategory.icon] || Package;

  return (
    <div className="space-y-6">
      {/* Category Header */}
      <div className="w-full max-w-md mx-auto flex items-center gap-4 mb-6 p-4 bg-card/50 rounded-xl border border-border/30">
        <div className="flex-shrink-0 inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-xl">
          <IconComponent className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold text-foreground mb-1">
            {currentCategory.name}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {currentCategory.description}
          </p>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {categories.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentCategoryIndex
                ? 'bg-primary'
                : index < currentCategoryIndex
                ? 'bg-success'
                : 'bg-muted'
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-muted-foreground">
          {currentCategoryIndex + 1} of {categories.length}
        </span>
      </div>

      {/* Products Grid */}
      <div className="space-y-4">
        {currentCategory.products.map((product) => {
          const ProductIcon = SUPPLY_ICONS[product.icon] || Package;
          const quantity = selectedSupplies[product.id]?.quantity || 0;
          
          return (
            <div
              key={product.id}
              className="border border-border/50 rounded-xl p-4 hover:border-border/80 transition-colors"
            >
              <div className="flex items-start gap-4">
                {/* Product Image Placeholder */}
                <div className="flex-shrink-0 w-16 h-16 bg-muted/50 rounded-lg flex items-center justify-center border border-border/30">
                  <ProductIcon className="w-8 h-8 text-muted-foreground" />
                </div>
                
                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground mb-1">
                    {product.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-1">
                    {product.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {product.dimensions}
                  </p>
                </div>
                
                {/* Quantity Controls */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(product.id, quantity - 1)}
                    disabled={quantity === 0}
                    className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  
                  <div className="min-w-[3rem] text-center">
                    <span className="font-medium text-foreground">{quantity}</span>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(product.id, quantity + 1)}
                    className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted/50 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Category Summary */}
      {getTotalItemsInCategory() > 0 && (
        <div className="bg-success/5 border border-success/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-success rounded-full" />
            <span className="text-sm font-medium text-success">
              {getTotalItemsInCategory()} items selected from {currentCategory.name}
            </span>
          </div>
        </div>
      )}

    </div>
  );
}