import React, { useRef, useEffect, useState } from 'react';
import { Input, Text, useColorModeValue, Box } from '@chakra-ui/react';

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
  const textRef = useRef<HTMLParagraphElement>(null);
  const [textWidth, setTextWidth] = useState(0);
  // Add local state to track input value
  const [localValue, setLocalValue] = useState(value);
  // Track if we're currently editing to prevent state conflicts
  const isEditingRef = useRef(false);
  
  const textColor = useColorModeValue('gray.800', 'white');
  const hoverColor = useColorModeValue('gray.700', 'gray.300');

  // Update local value when prop value changes and we're not editing
  useEffect(() => {
    if (!isEditingRef.current) {
      setLocalValue(value);
    }
  }, [value]);
  
  // Update editing ref when isEditing prop changes
  useEffect(() => {
    isEditingRef.current = isEditing;
    
    // When starting to edit, sync local value with prop value
    if (isEditing) {
      setLocalValue(value);
    }
  }, [isEditing, value]);

  // Measure the text width to apply to input field
  useEffect(() => {
    if (textRef.current) {
      // Create a temporary span to measure the exact text width
      const span = document.createElement('span');
      span.style.visibility = 'hidden';
      span.style.position = 'absolute';
      span.style.whiteSpace = 'nowrap';
      span.style.fontSize = window.getComputedStyle(textRef.current).fontSize;
      span.style.fontWeight = window.getComputedStyle(textRef.current).fontWeight;
      span.style.fontFamily = window.getComputedStyle(textRef.current).fontFamily;
      span.innerText = localValue;
      
      document.body.appendChild(span);
      const width = span.getBoundingClientRect().width;
      document.body.removeChild(span);
      
      // Add a small buffer to prevent text truncation
      setTextWidth(Math.max(width, 100) + 10);
    }
  }, [localValue]);

  React.useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Handle local input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
  };
  
  // Submit the final value to parent
  const handleSubmitValue = () => {
    onChange(localValue);
    onEditEnd();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent form submission
      handleSubmitValue();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      // Reset to original value on escape
      setLocalValue(value);
      onEditEnd();
    }
  };

  // Common styles for both text and input to maintain consistency
  const commonStyles = {
    fontSize: "sm",
    fontWeight: "medium",
    lineHeight: "normal",
    height: "20px", // Fixed height to prevent jumping
    display: "block", // Ensure consistent display
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  };

  if (isEditing) {
    return (
      <Box 
        width={textWidth > 0 ? `${textWidth}px` : 'auto'} 
        maxW="100%" 
        height={commonStyles.height}
        display="block"
      >
        <Input
          ref={inputRef}
          value={localValue}
          onChange={handleInputChange}
          onBlur={handleSubmitValue}
          onKeyDown={handleKeyDown}
          bg="transparent"
          border="none"
          _focus={{
            boxShadow: 'none',
            borderColor: 'transparent',
          }}
          p={0}
          m={0}
          pl={0}
          height={commonStyles.height}
          fontWeight={commonStyles.fontWeight}
          fontSize={commonStyles.fontSize}
          lineHeight={commonStyles.lineHeight}
          width="100%"
          display={commonStyles.display}
        />
      </Box>
    );
  }

  return (
    <Text 
      ref={textRef}
      onClick={onEditStart}
      cursor="pointer"
      color={textColor}
      _hover={{ color: hoverColor }}
      height={commonStyles.height}
      fontWeight={commonStyles.fontWeight}
      fontSize={commonStyles.fontSize}
      lineHeight={commonStyles.lineHeight}
      m={0}
      p={0}
      display={commonStyles.display}
      overflow={commonStyles.overflow}
      textOverflow={commonStyles.textOverflow}
      whiteSpace={commonStyles.whiteSpace}
    >
      {localValue}
    </Text>
  );
} 