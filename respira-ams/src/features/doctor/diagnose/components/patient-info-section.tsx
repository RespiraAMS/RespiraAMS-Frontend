"use client"

import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { Input } from "@/components/ui/input"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Button } from "@/components/ui/button"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import { Calendar } from "@/components/ui/calendar"

import { cn } from "@/lib/utils"

interface PatientInfoSectionProps {
  patientName: string
  dateOfBirth?: Date
  gender: string
  onPatientNameChange: (value: string) => void
  onDateOfBirthChange: (value: Date | undefined) => void
  onGenderChange: (value: string) => void
}

export function PatientInfoSection({
  patientName,
  dateOfBirth,
  gender,
  onPatientNameChange,
  onDateOfBirthChange,
  onGenderChange,
}: PatientInfoSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          1. Thông tin bệnh nhân
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Họ tên */}
          <div className="w-full">
            <label className="text-sm font-medium">
              Họ và tên<span className="text-red-500">*</span>
            </label>

            <Input
              className="mt-2 w-full"
              placeholder="Nguyễn Văn A"
              value={patientName}
              onChange={(e) =>
                onPatientNameChange(e.target.value)
              }
            />
          </div>

          {/* Ngày sinh */}
          <div className="w-full">
            <label className="text-sm font-medium">
              Ngày sinh<span className="text-red-500">*</span>
            </label>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "mt-2 w-full justify-start text-left font-normal",
                    !dateOfBirth &&
                    "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />

                  {dateOfBirth ? (
                    format(
                      dateOfBirth,
                      "dd/MM/yyyy",
                      { locale: vi }
                    )
                  ) : (
                    <span>Chọn ngày sinh</span>
                  )}
                </Button>
              </PopoverTrigger>

              <PopoverContent
                className="w-auto p-0"
                align="start"
              >
                <Calendar
                  mode="single"
                  selected={dateOfBirth}
                  onSelect={onDateOfBirthChange}
                  locale={vi}
                  captionLayout="dropdown"
                  startMonth={new Date(1900, 0)}
                  endMonth={new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Giới tính */}
          <div className="w-full">
            <label className="text-sm font-medium">
              Giới tính<span className="text-red-500">*</span>
            </label>

            <Select
              value={gender}
              onValueChange={onGenderChange}
            >
              <SelectTrigger className="mt-2 w-full">
                <SelectValue placeholder="Chọn giới tính" />
              </SelectTrigger>

              <SelectContent
                position="popper"
              >
                <SelectItem value="male">
                  Nam
                </SelectItem>

                <SelectItem value="female">
                  Nữ
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
