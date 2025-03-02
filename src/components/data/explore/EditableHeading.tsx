import React from 'react';
import { Input, Text, useColorModeValue } from '@chakra-ui/react';

interface EditableHeadingProps { 
  value: string;
  onChange: (value: string) => void;
  isEditing: boolean;
  onEditStart: () => void;
  onEditEnd: () => void;
  className?: string;
}

export function EditableHeading({ 
  value, 
  onChange, 
  isEditing, 
  onEditStart, 
  onEditEnd,
  className 
}: EditableHeadingProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const textColor = useColorModeValue('gray.800', 'white');
  const hoverColor = useColorModeValue('gray.700', 'gray.300');

  React.useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent form submission
      onEditEnd();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      onEditEnd();
    }
  };

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onEditEnd}
        onKeyDown={handleKeyDown}
        bg="transparent"
        border="none"
        _focus={{
          boxShadow: 'none',
        }}
        fontWeight="medium"
        fontSize="sm"
        p={0}
        size="sm"
      />
    );
  }

  return (
    <Text 
      onClick={onEditStart}
      fontSize="sm"
      fontWeight="medium"
      cursor="pointer"
      color={textColor}
      _hover={{ color: hoverColor }}
    >
      {value}
    </Text>
  );
} 