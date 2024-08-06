import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { TimePicker } from "@/components/ui/custom/TimePicker";
import { Command, Plus, Trash2 } from "lucide-react";
import { THour } from "@/types/index.types";

type HoursType = {
  selectedHours: THour[];
  setSelectedHours: (value: THour[]) => void;
  day: string;
};

export default function Hours({ selectedHours, setSelectedHours, day }: HoursType) {
  const [hourFrom, setHourFrom] = useState<string>("");
  const [hourTo, setHourTo] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);

  useEffect(() => {
    if (dateFrom) {
      setHourFrom(formatTime(dateFrom));
    }
    if (dateTo) {
      setHourTo(formatTime(dateTo));
    }
  }, [dateFrom, dateTo]);

  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  };

  const validateTimeRange = () => {
    if (!hourFrom || !hourTo) {
      setError("Please select from and to time");
      return false;
    }

    const fromMinutes = convertToMinutes(hourFrom);
    let toMinutes = convertToMinutes(hourTo);

    // Handle midnight wrap-around
    if (toMinutes === 0) {
      toMinutes = 24 * 60;
    }

    if (fromMinutes >= toMinutes) {
      setError("Invalid time range");
      return false;
    }

    if (isOverlapping(fromMinutes, toMinutes)) {
      setError("Time range overlaps with existing range for this day");
      return false;
    }

    setError("");
    return true;
  };

  const convertToMinutes = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const isOverlapping = (fromMinutes: number, toMinutes: number) => {
    return selectedHours.some(({ day: selectedDay, value }) => {
      if (selectedDay !== day) return false;

      const existingFromMinutes = convertToMinutes(value.from);
      let existingToMinutes = convertToMinutes(value.to);

      if (existingToMinutes === 0) {
        existingToMinutes = 24 * 60;
      }

      const isStartOverlap = fromMinutes < existingToMinutes && fromMinutes >= existingFromMinutes;
      const isEndOverlap = toMinutes > existingFromMinutes && toMinutes <= existingToMinutes;
      const isEnclosingOverlap = fromMinutes <= existingFromMinutes && toMinutes >= existingToMinutes;

      return isStartOverlap || isEndOverlap || isEnclosingOverlap;
    });
  };

  const onAddHours = () => {
    if (!validateTimeRange()) return;

    const newHour = {
      day,
      value: { from: hourFrom, to: hourTo },
    };

    setSelectedHours((prevHours) => [...prevHours, newHour]);
  };

  const onRemoveHour = (day: string, hour: THour["value"]) => {
    setSelectedHours((prevHours) =>
      prevHours.filter(({ day: d, value }) => !(d === day && value.from === hour.from && value.to === hour.to))
    );
  };

  const groupedHours = selectedHours.reduce((acc, { day: selectedDay, value }) => {
    if (!acc[selectedDay]) {
      acc[selectedDay] = [];
    }
    acc[selectedDay].push(value);
    return acc;
  }, {} as Record<string, THour["value"][]>);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row gap-3 justify-center items-center">
        <span>from</span>
        <TimePicker date={dateFrom} setDate={setDateFrom} />
      </div>
      <div className="flex flex-row gap-3 justify-center items-center">
        <span>to&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
        <TimePicker date={dateTo} setDate={setDateTo} />
      </div>
      <Button variant={"outline"} className="w-full" onClick={onAddHours}>
        <Plus />
      </Button>
      {error && <span className="text-red-500">{error}</span>}
      <ul>
        {Object.entries(groupedHours).map(([hoursDay, hours]) => (
          <li key={hoursDay}>
            <span className={hoursDay === day ? "text-yellow-700 font-bold" : ""}>{hoursDay}:</span>
            <ul>
              {hours.map((hour, index) => (
                <li key={index} className="flex flex-row justify-between items-center">
                  <span>- {hour.from} - {hour.to}</span>
                  {hoursDay === day && (
                    <Button onClick={() => onRemoveHour(day, hour)} variant={"outline"} size="icon">
                      <Trash2 color="#FF3B6B" />
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
