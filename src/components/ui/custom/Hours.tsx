import { Command, Plus, Trash2 } from "lucide-react";
import React, { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { TimePicker } from "@/components/ui/custom/TimePicker";

type HoursType = {
  selectedHours: { day: string; value: string }[];
  setSelectedHours: (value: { day: string; value: string; }[]) => void;
  day: string;
  hoursList: { day: string; value: string }[];
}

export default function Hours({ selectedHours, setSelectedHours, day, hoursList }: HoursType) {
  const [hourFrom, setHourFrom] = React.useState<string>('');
  const [hourTo, setHourTo] = React.useState<string>('');
  const [error, setError] = React.useState<string>('');
  const [dateFrom, setDateFrom] = React.useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = React.useState<Date | undefined>(undefined);

  React.useEffect(() => {
    if (dateFrom) {
      const hours = dateFrom.getHours();
      const minutes = dateFrom.getMinutes();
      setHourFrom(`${hours}:${minutes < 10 ? '0' + minutes : minutes}`);
      console.log(`From: ${hourFrom}`)
    }
    if (dateTo) {
      const hours = dateTo.getHours();
      const minutes = dateTo.getMinutes();
      setHourTo(`${hours}:${minutes < 10 ? '0' + minutes : minutes}`);
      console.log(`To: ${hourTo}`)
    }
  }, [dateFrom, dateTo]);

  const onAddHours = () => {
    if (!hourFrom || !hourTo) {
      setError('Please select from and to time');
      return;
    }
    if (hourFrom.substring(0, hourFrom.indexOf(':')) >= hourTo.substring(0, hourTo.indexOf(':'))) {
      setError('Invalid time range');
      return;
    }

    const newHour = { day, value: `${hourFrom} - ${hourTo}` };
    const exists = selectedHours.some(hour => hour.day === day && hour.value === newHour.value);

    if (exists) {
      setError('Time range already exists for this day');
    } else {
      setError('');
      setSelectedHours(prevHours => [...prevHours, newHour]);
    }
  };

  const onRemoveHour = (day: string, hour: string) => {
    setSelectedHours((prevHours: HourTypes[]) => {
      // Find the index of the hour that matches the specified day and hour
      const hourIndex = prevHours.findIndex(hours => hours.day === day && hours.value === hour);
      if (hourIndex > -1) {
        // Create a copy of the previous hours array
        const updatedHours = [...prevHours];
        // Remove the hour at the found index
        updatedHours.splice(hourIndex, 1);
        // Return the updated hours array
        return updatedHours;
      }
      // If no match is found, return the previous hours array unchanged
      return prevHours;
    });
  }


  // Group hours by day
  const groupedHours = selectedHours.reduce((acc, hour) => {
    // Check if the accumulator already has an entry for the current hour's day
    if (!acc[hour.day]) {
      // If not, create an empty array for this day
      acc[hour.day] = [];
    }

    // Push the current hour's value to the array for this day
    acc[hour.day].push(hour.value);

    // Return the updated accumulator to be used in the next iteration
    return acc;
  }, {} as Record<string, string[]>); // Initial value of the accumulator is an empty object

  return (
    <>
      <div className="flex flex-col gap-2">
        <div className="flex flex-row gap-3 justify-center items-center align-center">
          <span>from</span>
          <TimePicker date={dateFrom} setDate={setDateFrom} />
        </div>
        <div className="flex flex-row gap-3 justify-center items-center  align-center">
          <span>to&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
          <TimePicker date={dateTo} setDate={setDateTo} />
        </div>
        <Button variant={"outline"} className={'w-full'} onClick={onAddHours}><Plus /></Button>
        {error && <span className="text-red-500">{error}</span>}
        <ul>
          {Object.entries(groupedHours).map(([hoursDay, hours]) => (
            <li key={hoursDay}>
              {hoursDay == day && <span className="text-yellow-700 font-bold">{hoursDay}:</span>}
              {hoursDay != day && <span>{hoursDay}:</span>}
              <ul>
                {hours.map((hour, index) => (
                  <li key={index} className="flex flex-row justify-between items-center">
                    <span>- {hour}</span>
                    {hoursDay == day && <Button onClick={() => onRemoveHour(day, hour)} variant={'outline'} size="icon"><Trash2 color="#FF3B6B" /></Button>}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
