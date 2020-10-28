import React, { useState, useEffect, useRef } from "react";
// import { LabelWrapperProps, LabelWrapper } from "./Common";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight
} from "react-feather";
import { Manager, Reference, Popper } from "react-popper";
import { range } from "lodash";

const daysOfWeek = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
];

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

export const inputStyle = {
  paddingTop: "0.375rem",
  paddingBottom: "0.375rem"
};

interface DatePickerProps {
  date: Date;
  onChange: (date: Date) => void;
}

export const DatePicker: React.FC<DatePickerProps> = props => (
  //   <LabelWrapper label={props.label} info={props.info}>
  <RawDatePicker date={props.date} onChange={props.onChange}></RawDatePicker>
  //   </LabelWrapper>
);

export const RawDatePicker: React.FC<{
  date: Date;
  onChange: (date: Date) => void;
}> = props => {
  const [showCalendar, setShowCalendar] = useState(false);
  const popupNode = useRef<HTMLElement>();

  function emitSelection(date: Date) {
    props.onChange(date);
    setShowCalendar(false);
  }

  function formattedDate(date: Date): string {
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  }

  /**
   * This useEffect makes sure the popper hides when clicked outside
   */
  useEffect(() => {
    function mouseDownListener(e: MouseEvent) {
      if (popupNode.current && !popupNode.current.contains(e.target as Node)) {
        setShowCalendar(false);
      }
    }

    document.addEventListener("mousedown", mouseDownListener);

    return () => {
      document.removeEventListener("mousedown", mouseDownListener);
    };
  }, [showCalendar]);

  return (
    <Manager>
      <Reference>
        {({ ref }) => (
          <div className="flex" ref={ref}>
            <input
              className="border-2 rounded-l px-3 outline-none focus:border-gray-400 flex-grow"
              type="text"
              style={inputStyle}
              onFocus={e => setShowCalendar(true)}
              value={formattedDate(props.date)}
              readOnly
            />
            <button
              className="bg-gray-300 rounded-r flex items-center justify-center text-sm font-semibold text-gray-700 px-2 focus:outline-none"
              onClick={e => setShowCalendar(!showCalendar)}
            >
              <CalendarIcon size="20" color="#666" />
            </button>
          </div>
        )}
      </Reference>
      <Popper placement="bottom-start" innerRef={node => (popupNode.current = node)}>
        {({ ref, style, placement, arrowProps }) =>
          showCalendar ? (
            <Calendar
              date={props.date}
              onChange={emitSelection}
              onClose={() => setShowCalendar(false)}
              placement={placement}
              style={style}
              ref={ref as React.Ref<HTMLDivElement>}
            />
          ) : null
        }
      </Popper>
    </Manager>
  );
};

type SelectionState = "date" | "month" | "year";

interface CalendarProps {
  date: Date;
  onChange: (date: Date) => void;
  onClose: () => void;
  style: React.CSSProperties;
  placement: string;
  ref: React.Ref<HTMLDivElement>;
}

const Calendar: React.FC<CalendarProps> = React.forwardRef<
  HTMLDivElement,
  CalendarProps
>((props, ref) => {
  const [selState, setSelState] = useState<SelectionState>("date");

  const [dateClone, setDateClone] = useState(new Date(props.date.valueOf()));

  let selectionComponent = null;
  switch (selState) {
    case "date":
      selectionComponent = (
        <DateSelection
          date={props.date}
          innerDate={dateClone}
          onChange={date => props.onChange(date)}
          onChangeInnerDate={setDateClone}
          onChangeSelectionState={setSelState}
        />
      );
      break;
    case "month":
      selectionComponent = (
        <MonthSelection
          date={props.date}
          innerDate={dateClone}
          onChangeInnerDate={setDateClone}
          onChangeSelectionState={setSelState}
        />
      );
      break;
    case "year":
      selectionComponent = (
        <YearSelection
          date={props.date}
          innerDate={dateClone}
          onChangeInnerDate={setDateClone}
          onChangeSelectionState={setSelState}
        />
      );
      break;
  }

  return (
    <div
      className="bg-white relative shadow-lg max-w-xs w-64 p-2 rounded-lg"
      ref={ref}
      data-placement={props.placement}
      style={props.style}
    >
      {selectionComponent}
    </div>
  );
});

interface SelectionProps {
  date: Date;
  innerDate: Date;
  onChangeInnerDate: (date: Date) => void;
}

interface DateSelectionProps extends SelectionProps {
  onChange: (date: Date) => void;
  onChangeSelectionState: (state: SelectionState) => void;
}

interface MonthYearSelectionProps extends SelectionProps {
  onChangeSelectionState: (state: SelectionState) => void;
}

/**
 * Date Selection Component
 * @param props
 */
const DateSelection: React.FC<DateSelectionProps> = props => {
  function dateCompare(date: number, dateClone: Date, propDate: Date): boolean {
    if (
      date === propDate.getDate() &&
      dateClone.getMonth() === propDate.getMonth() &&
      dateClone.getFullYear() === propDate.getFullYear()
    ) {
      return true;
    }
    return false;
  }

  function handleDateSelect(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) {
    let date = parseInt(e.currentTarget.innerHTML);
    let selectedDate = new Date(props.innerDate.valueOf());
    selectedDate.setDate(date);
    props.onChange(selectedDate);
  }

  return (
    <div
      className="text-gray-800"
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr 1fr 1fr",
        gridTemplateRows: "2rem auto",
        alignItems: "stretch"
      }}
    >
      <button
        className={buttonClassName}
        onClick={e => props.onChangeInnerDate(prevMonth(props.innerDate))}
      >
        <ChevronLeft size={20} className="stroke-current" />
      </button>

      <button
        className={`${buttonClassName} font-semibold`}
        style={{ gridColumn: "2/5" }}
        onClick={e => props.onChangeSelectionState("month")}
      >
        {monthName(props.innerDate)}
      </button>

      <button
        className={`${buttonClassName} font-semibold`}
        style={{ gridColumn: "5/7" }}
        onClick={e => props.onChangeSelectionState("year")}
      >
        {props.innerDate.getFullYear()}
      </button>

      <button
        className={buttonClassName}
        onClick={e => props.onChangeInnerDate(nextMonth(props.innerDate))}
      >
        <ChevronRight size={20} className="stroke-current" />
      </button>

      {daysOfWeek.map(day => (
        <div
          key={(200 + day).toString()}
          className="p-1 text-sm font-semibold"
          style={{ textAlign: "center" }}
        >
          {day[0]}
        </div>
      ))}

      {range(beginningDayOfWeek(props.innerDate)).map(i => (
        <div key={(400 + i).toString()}></div>
      ))}

      {range(
        1,
        daysInMonth(props.innerDate.getMonth(), props.innerDate.getFullYear()) +
          1
      ).map(date => (
        <button
          key={(300 + date).toString()}
          className={`hover:bg-gray-200 rounded p-1 text-sm ${
            dateCompare(date, props.innerDate, props.date)
              ? "bg-gray-300 font-semibold"
              : ""
          }`}
          onClick={handleDateSelect}
          style={{ textAlign: "center" }}
        >
          {date}
        </button>
      ))}
    </div>
  );
};

/**
 * Month Selection Component
 * @param props
 */
const MonthSelection: React.FC<MonthYearSelectionProps> = props => {
  function dateWithMonth(date: Date, month: number): Date {
    let dateClone = new Date(date.valueOf());
    dateClone.setMonth(month);
    return dateClone;
  }

  return (
    <div
      className="h-48"
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr 1fr",
        gridTemplateRows: "2rem auto",
        alignItems: "stretch"
      }}
    >
      <div className="flex" style={{ gridColumn: "1/5" }}>
        <CalButton
          chevron="left"
          onClick={e => props.onChangeInnerDate(prevYear(props.innerDate))}
        />
        <CalButton
          className="flex-grow"
          onClick={e => props.onChangeSelectionState("year")}
        >
          {props.innerDate.getFullYear()}
        </CalButton>
        <CalButton
          chevron="right"
          onClick={e => props.onChangeInnerDate(nextYear(props.innerDate))}
        />
      </div>
      {months.map((month, index) => (
        <CalButton
          onClick={e => {
            props.onChangeInnerDate(dateWithMonth(props.innerDate, index));
            props.onChangeSelectionState("date");
          }}
        >
          {month.substring(0, 3)}
        </CalButton>
      ))}
    </div>
  );
};

/**
 * Year Selection Component
 * @param props
 */
const YearSelection: React.FC<MonthYearSelectionProps> = props => {
  function dateWithYear(date: Date, year: number): Date {
    let dateClone = new Date(date.valueOf());
    dateClone.setFullYear(year);
    return dateClone;
  }

  const minYear = () => props.innerDate.getFullYear() - 6;
  const maxYear = () => minYear() + 12;

  return (
    <div
      className="h-48"
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr 1fr",
        gridTemplateRows: "2rem auto",
        alignItems: "stretch"
      }}
    >
      <div className="flex" style={{ gridColumn: "1/5" }}>
        <CalButton
          chevron="left"
          onClick={e => props.onChangeInnerDate(prev12Year(props.innerDate))}
        />
        <CalButton className="flex-grow">
          {`${minYear()} - ${maxYear() - 1}`}
        </CalButton>
        <CalButton
          chevron="right"
          onClick={e => props.onChangeInnerDate(next12Year(props.innerDate))}
        />
      </div>
      {range(minYear(), maxYear()).map(year => (
        <CalButton
          onClick={e => {
            props.onChangeInnerDate(dateWithYear(props.innerDate, year));
            props.onChangeSelectionState("month");
          }}
        >
          {year}
        </CalButton>
      ))}
    </div>
  );
};

/**
 * Beginning of Day of Week of a Month
 * @param date
 */
function beginningDayOfWeek(date: Date): number {
  const dateClone = date;
  dateClone.setDate(1);
  return dateClone.getDay();
}

/**
 * Month name from a Date
 * @param date
 */
function monthName(date: Date) {
  return months[date.getMonth()];
}

/**
 * Days in month
 */
function daysInMonth(month: number, year: number) {
  switch (month) {
    case 0:
    case 2:
    case 4:
    case 6:
    case 7:
    case 9:
    case 11:
      return 31;
    case 1:
      return isLeapYear(year) ? 29 : 28;
    default:
      return 30;
  }
}

/**
 * Is Leap Year
 * @param year
 */
function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * Next Month
 * @param date
 */
function nextMonth(date: Date): Date {
  let dateClone = new Date(date.valueOf());
  if (date.getMonth() === 11) {
    dateClone.setFullYear(date.getFullYear() + 1);
    dateClone.setMonth(0);
  } else {
    dateClone.setMonth(date.getMonth() + 1);
  }
  return dateClone;
}

/**
 * Next Month
 * @param date
 */
function prevMonth(date: Date): Date {
  let dateClone = new Date(date.valueOf());
  if (date.getMonth() === 0) {
    dateClone.setFullYear(date.getFullYear() - 1);
    dateClone.setMonth(11);
  } else {
    dateClone.setMonth(date.getMonth() - 1);
  }
  return dateClone;
}

/**
 * Year Function
 * @param date
 */
function increaseYear(date: Date, step: number) {
  let dateClone = new Date(date.valueOf());
  dateClone.setFullYear(date.getFullYear() + step);
  return dateClone;
}

const prevYear = (date: Date) => increaseYear(date, -1);
const nextYear = (date: Date) => increaseYear(date, 1);
const prev12Year = (date: Date) => increaseYear(date, -12);
const next12Year = (date: Date) => increaseYear(date, 12);

const buttonClassName =
  "hover:bg-gray-200 rounded p-1 text-sm flex align-center justify-center focus:outline-none";

const CalButton: React.FC<{
  chevron?: "right" | "left";
  className?: string;
  style?: React.StyleHTMLAttributes<HTMLButtonElement>;
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}> = props => {
  let children = null;

  if (props.chevron && props.chevron === "left")
    children = <ChevronLeft size={20} className="stroke-current" />;
  else if (props.chevron && props.chevron === "right")
    children = <ChevronRight size={20} className="stroke-current" />;
  else children = props.children;

  return (
    <button
      className={`${buttonClassName} ${props.className}`}
      style={props.style}
      onClick={props.onClick}
    >
      {children}
    </button>
  );
};
