import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export interface TextareaRowProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder: string;
  rows?: number;
  required?: boolean;
  className?: string;
  disabled?: boolean;
}

const TextareaRow = ({ id, label, value, onChange, placeholder, rows, required, className, disabled }: TextareaRowProps) => {
  return (
    <div className={`flex flex-col gap-2 ${className || ''}`}>
      <Label htmlFor={id} className="text-base">{label}</Label>
      <Textarea
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        required={required}
        disabled={disabled}
      />
    </div>
  );
};

export default TextareaRow;
