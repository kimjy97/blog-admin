import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface InputRowProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  required?: boolean;
  type?: string;
  disabled?: boolean;
}

const InputRow = ({ id, label, value, onChange, placeholder, required, type = "text", disabled }: InputRowProps) => {
  return (
    <div className="flex-1 flex flex-col gap-2">
      <Label htmlFor={id} className="text-base">{label}</Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
      />
    </div>
  );
};

export default InputRow;
