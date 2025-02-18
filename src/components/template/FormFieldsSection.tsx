
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { CustomField } from "@/types/template";
import { X, GripVertical } from "lucide-react";
import { Label } from "@/components/ui/label";

interface FormFieldsSectionProps {
  fields: CustomField[];
  onChange: (fields: CustomField[]) => void;
}

export const FormFieldsSection = ({ fields, onChange }: FormFieldsSectionProps) => {
  const addNewField = () => {
    const newField: CustomField = {
      id: crypto.randomUUID(),
      name: {
        en: "",
        my: "",
      },
      type: "text",
      required: false,
      order: fields.length,
    };
    onChange([...fields, newField]);
  };

  const updateField = (id: string, updates: Partial<CustomField>) => {
    onChange(
      fields.map((field) =>
        field.id === id ? { ...field, ...updates } : field
      )
    );
  };

  const removeField = (id: string) => {
    onChange(fields.filter((field) => field.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Form Fields</h3>
        <Button onClick={addNewField} variant="outline">
          Add New Field
        </Button>
      </div>

      <div className="space-y-4">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="flex gap-4 items-start p-4 bg-gray-50 rounded-lg relative group"
          >
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
              onClick={() => removeField(field.id)}
            >
              <X className="h-4 w-4" />
            </button>

            <div className="cursor-move">
              <GripVertical className="h-5 w-5 text-gray-400" />
            </div>

            <div className="flex-1 grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Field Name (English)</Label>
                  <Input
                    value={field.name.en}
                    onChange={(e) =>
                      updateField(field.id, {
                        name: { ...field.name, en: e.target.value },
                      })
                    }
                    placeholder="Enter field name in English"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Field Name (Malay)</Label>
                  <Input
                    value={field.name.my}
                    onChange={(e) =>
                      updateField(field.id, {
                        name: { ...field.name, my: e.target.value },
                      })
                    }
                    placeholder="Enter field name in Malay"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Field Type</Label>
                  <Select
                    value={field.type}
                    onValueChange={(value: CustomField["type"]) =>
                      updateField(field.id, { type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select field type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="textarea">Text Area</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2 h-full">
                  <Label>Required Field</Label>
                  <Switch
                    checked={field.required}
                    onCheckedChange={(checked) =>
                      updateField(field.id, { required: checked })
                    }
                  />
                </div>
              </div>

              {field.type !== "date" && (
                <div className="space-y-2">
                  <Label>Default Value (Optional)</Label>
                  <Input
                    value={field.defaultValue || ""}
                    onChange={(e) =>
                      updateField(field.id, { defaultValue: e.target.value })
                    }
                    placeholder="Enter default value"
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
