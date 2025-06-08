import React, { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

export interface TagInputRowProps {
  id: string;
  label: string;
  tags: string[];
  currentTag: string;
  onCurrentTagChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAddTag: () => void;
  onRemoveTag: (tagToRemove: string) => void;
  placeholder?: string;
  disabled?: boolean;
  existingTags?: string[];
}

const TagInputRow = ({
  id,
  label,
  tags,
  currentTag,
  onCurrentTagChange,
  onAddTag,
  onRemoveTag,
  placeholder,
  disabled,
  existingTags,
}: TagInputRowProps) => {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAddTagFromSuggestion = (tag: string) => {
    if (!tags.includes(tag)) {
      onCurrentTagChange({ target: { value: tag } } as React.ChangeEvent<HTMLInputElement>);
      setOpen(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id} className="text-base">{label}</Label>
      <div className="flex items-center space-x-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Input
              ref={inputRef}
              id={id}
              value={currentTag}
              onChange={onCurrentTagChange}
              placeholder={placeholder}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              className="w-60"
            />
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
            <Command>
              <CommandInput placeholder="태그 검색..." value={currentTag} onValueChange={(value: string) => {
                onCurrentTagChange({ target: { value: value } } as React.ChangeEvent<HTMLInputElement>);
              }} />
              <CommandList>
                <CommandEmpty>태그를 찾을 수 없습니다.</CommandEmpty>
                <CommandGroup>
                  {existingTags?.filter(tag =>
                    tag.toLowerCase().includes(currentTag.toLowerCase()) && !tags.includes(tag)
                  ).map((tag) => (
                    <CommandItem
                      key={tag}
                      value={tag}
                      onSelect={(value: string) => {
                        handleAddTagFromSuggestion(value);
                      }}
                    >
                      {tag}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <Button type="button" onClick={onAddTag} variant="outline" disabled={disabled}>추가</Button>
      </div>
      <div className="mt-2 space-x-1">
        {tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="mr-1 mb-1">
            {tag}
            <button type="button" onClick={() => !disabled && onRemoveTag(tag)} className="ml-1 cursor-pointer" disabled={disabled}>
              <XMarkIcon className='size-4' />
            </button>
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default TagInputRow;
