import React, { useState } from "react";
import "../node_modules/tailwindcss/dist/tailwind.css";
import { DatePicker } from "./Datepicker";

const App: React.FC = () => {
  const [date, setDate] = useState(new Date());
  return (
    <div className="max-w-xs mt-12 mx-auto">
      <DatePicker date={date} onChange={setDate}></DatePicker>
    </div>
  );
};

export default App;
