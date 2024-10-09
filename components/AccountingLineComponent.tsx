"use client"

import React, { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';

// Mock data for accounts, projects, and departments
const accounts = [
  { number: '1000', name: 'Cash' },
  { number: '1100', name: 'Accounts Receivable' },
  { number: '2000', name: 'Accounts Payable' },
  { number: '3000', name: 'Revenue' },
  { number: '4000', name: 'Expenses' },
];

const projects = [
  { number: 'P001', name: 'Project A' },
  { number: 'P002', name: 'Project B' },
  { number: 'P003', name: 'Project C' },
];

const departments = [
  { number: 'D001', name: 'Sales' },
  { number: 'D002', name: 'Marketing' },
  { number: 'D003', name: 'IT' },
];

type DropdownField = 'account' | 'project' | 'department';

export default function AccountingLineComponent() {
  const [lines, setLines] = useState([{}]);
  const [currentLine, setCurrentLine] = useState(0);

  const createNewLine = () => {
    setLines([...lines, {}]);
    setCurrentLine(lines.length);
  };

  return (
    <div className="space-y-4">
      {lines.map((_, index) => (
        <AccountingLine 
          key={index} 
          isActive={index === currentLine}
          onComplete={index === lines.length - 1 ? createNewLine : undefined}
        />
      ))}
    </div>
  );
}

function AccountingLine({ isActive, onComplete }: { isActive: boolean, onComplete?: () => void }) {
  const [fields, setFields] = useState({
    account: '',
    amount: '',
    project: '',
    department: '',
    postingText: '',
  });
  const [showDropdown, setShowDropdown] = useState<DropdownField | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRefs = {
    account: useRef<HTMLInputElement>(null),
    amount: useRef<HTMLInputElement>(null),
    project: useRef<HTMLInputElement>(null),
    department: useRef<HTMLInputElement>(null),
    postingText: useRef<HTMLInputElement>(null),
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (field: keyof typeof fields) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFields({ ...fields, [field]: e.target.value });
    if (['account', 'project', 'department'].includes(field)) {
      setShowDropdown(field as DropdownField);
      setSelectedIndex(0);
    }
  };

  const getFilteredOptions = (field: DropdownField) => {
    const options = field === 'account' ? accounts : field === 'project' ? projects : departments;
    const value = fields[field].toLowerCase();
    return options.filter(
      option => option.number.toLowerCase().includes(value) || option.name.toLowerCase().includes(value)
    );
  };

  const handleSelectOption = (field: DropdownField, option: { number: string, name: string }) => {
    setFields({ ...fields, [field]: `${option.number} - ${option.name}` });
    setShowDropdown(null);
    const nextField = getNextField(field);
    inputRefs[nextField]?.current?.focus();
  };

  const highlightMatch = (text: string, highlight: string) => {
    if (!highlight.trim()) {
      return <span>{text}</span>;
    }
    const regex = new RegExp(`(${highlight})`, 'gi');
    const parts = text.split(regex);
    return (
      <span>
        {parts.map((part, index) => 
          regex.test(part) ? <span key={index} className="text-blue-500 font-semibold">{part}</span> : part
        )}
      </span>
    );
  };

  const handleKeyDown = (field: keyof typeof fields) => (e: KeyboardEvent<HTMLInputElement>) => {
    if (['account', 'project', 'department'].includes(field) && showDropdown) {
      const filteredOptions = getFilteredOptions(field as DropdownField);
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => (prev < filteredOptions.length - 1 ? prev + 1 : prev));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredOptions[selectedIndex]) {
            handleSelectOption(field as DropdownField, filteredOptions[selectedIndex]);
          }
          break;
        case 'Escape':
          setShowDropdown(null);
          break;
      }
    } else if (e.key === 'Tab' && !e.shiftKey) {
      if (field === 'postingText' && onComplete) {
        e.preventDefault();
        onComplete();
      }
    }
  };

  const getNextField = (currentField: keyof typeof fields): keyof typeof fields => {
    const fieldOrder: (keyof typeof fields)[] = ['account', 'amount', 'project', 'department', 'postingText'];
    const currentIndex = fieldOrder.indexOf(currentField);
    return fieldOrder[(currentIndex + 1) % fieldOrder.length];
  };

  const renderDropdown = (field: DropdownField) => {
    const filteredOptions = getFilteredOptions(field);
    return (
      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
        <ScrollArea className="h-[200px]">
          {filteredOptions.map((option, index) => (
            <div
              key={option.number}
              className={`cursor-pointer p-2 ${
                index === selectedIndex ? 'bg-gray-100' : 'hover:bg-gray-50'
              }`}
              onClick={() => handleSelectOption(field, option)}
            >
              {highlightMatch(option.number, fields[field])} - {highlightMatch(option.name, fields[field])}
            </div>
          ))}
        </ScrollArea>
      </div>
    );
  };

  return (
    <div className="flex space-x-4">
      <div className="flex-1 relative" ref={dropdownRef}>
        <Label htmlFor="account" className="sr-only">Account No.</Label>
        <Input
          id="account"
          ref={inputRefs.account}
          value={fields.account}
          onChange={handleInputChange('account')}
          onKeyDown={handleKeyDown('account')}
          placeholder="Account No."
          autoComplete="off"
        />
        {showDropdown === 'account' && renderDropdown('account')}
      </div>
      <div className="flex-1">
        <Label htmlFor="amount" className="sr-only">Amount</Label>
        <Input
          id="amount"
          ref={inputRefs.amount}
          type="number"
          value={fields.amount}
          onChange={handleInputChange('amount')}
          onKeyDown={handleKeyDown('amount')}
          placeholder="Amount"
        />
      </div>
      <div className="flex-1 relative">
        <Label htmlFor="project" className="sr-only">Project</Label>
        <Input
          id="project"
          ref={inputRefs.project}
          value={fields.project}
          onChange={handleInputChange('project')}
          onKeyDown={handleKeyDown('project')}
          placeholder="Project"
          autoComplete="off"
        />
        {showDropdown === 'project' && renderDropdown('project')}
      </div>
      <div className="flex-1 relative">
        <Label htmlFor="department" className="sr-only">Department</Label>
        <Input
          id="department"
          ref={inputRefs.department}
          value={fields.department}
          onChange={handleInputChange('department')}
          onKeyDown={handleKeyDown('department')}
          placeholder="Department"
          autoComplete="off"
        />
        {showDropdown === 'department' && renderDropdown('department')}
      </div>
      <div className="flex-1">
        <Label htmlFor="postingText" className="sr-only">Posting Text</Label>
        <Input
          id="postingText"
          ref={inputRefs.postingText}
          value={fields.postingText}
          onChange={handleInputChange('postingText')}
          onKeyDown={handleKeyDown('postingText')}
          placeholder="Posting Text"
        />
      </div>
    </div>
  );
}