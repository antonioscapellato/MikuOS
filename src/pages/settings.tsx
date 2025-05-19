import { useState } from 'react';
import { Button, Input, Chip, Card, CardBody, CardHeader, Divider } from '@heroui/react';
import { FiPlus } from 'react-icons/fi';
import { useDomainPreferences } from '../context/DomainPreferencesContext';

export default function Settings() {
  const [newIncludeDomain, setNewIncludeDomain] = useState('');
  const [newExcludeDomain, setNewExcludeDomain] = useState('');
  const {
    preferences,
    addIncludeDomain,
    removeIncludeDomain,
    addExcludeDomain,
    removeExcludeDomain,
    clearAllDomains
  } = useDomainPreferences();

  const handleAddIncludeDomain = () => {
    if (newIncludeDomain.trim()) {
      addIncludeDomain(newIncludeDomain.trim());
      setNewIncludeDomain('');
    }
  };

  const handleAddExcludeDomain = () => {
    if (newExcludeDomain.trim()) {
      addExcludeDomain(newExcludeDomain.trim());
      setNewExcludeDomain('');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <div className="mb-8">
        <div className="pb-0 pt-6">
          <h2 className="text-xl font-semibold">Search Domain Preferences</h2>
        </div>
        <div>
          <p className="text-default-600 mb-4">
            Customize which domains to include or exclude from your search results.
          </p>
          
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-3">Include Domains</h3>
            <p className="text-sm text-default-500 mb-3">
              Search results will prioritize content from these domains.
            </p>
            
            <div className="flex gap-2 mb-3">
              <Input
                placeholder="e.g., example.com"
                value={newIncludeDomain}
                onChange={(e) => setNewIncludeDomain(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddIncludeDomain()}
                className="flex-grow"
              />
              <Button 
                startContent={<FiPlus />}
                onPress={handleAddIncludeDomain}
                className="bg-default-900 text-default-100"
              >
                Add
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-3">
              {preferences.includeDomains.length > 0 ? (
                preferences.includeDomains.map((domain) => (
                  <Chip
                    key={domain}
                    onClose={() => removeIncludeDomain(domain)}
                    variant="flat"
                    className="bg-default-100 text-default-600"
                  >
                    {domain}
                  </Chip>
                ))
              ) : (
                <p className="text-sm text-default-400 italic">No domains added yet</p>
              )}
            </div>
          </div>
          
          <Divider className="my-6" />
          
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Exclude Domains</h3>
            <p className="text-sm text-default-500 mb-3">
              Search results will not include content from these domains.
            </p>
            
            <div className="flex gap-2 mb-3">
              <Input
                placeholder="e.g., example.com"
                value={newExcludeDomain}
                onChange={(e) => setNewExcludeDomain(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddExcludeDomain()}
                className="flex-grow"
              />
              <Button 
                startContent={<FiPlus />}
                onPress={handleAddExcludeDomain}
                className="bg-default-900 text-default-100"
              >
                Add
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-3">
              {preferences.excludeDomains.length > 0 ? (
                preferences.excludeDomains.map((domain) => (
                  <Chip
                    key={domain}
                    onClose={() => removeExcludeDomain(domain)}
                    variant="flat"
                    className="bg-default-100 text-default-600"
                  >
                    {domain}
                  </Chip>
                ))
              ) : (
                <p className="text-sm text-default-400 italic">No domains added yet</p>
              )}
            </div>
          </div>
          
          <Button  
            variant="flat"
            onPress={clearAllDomains}
            size="sm"
            className="mt-4 bg-default-50 text-default-600 rounded-full"
          >
            Clear All Domains
          </Button>
        </div>
      </div>
    </div>
  );
}
