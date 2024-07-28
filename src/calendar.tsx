import React, { useState, useEffect } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import axios from 'axios';
import { TodoItem } from './types'; // Adjust the import path if necessary

const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [tasks, setTasks] = useState<TodoItem[]>([]);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);

  useEffect(() => {
    // Fetch tasks from the API
    const fetchTasks = async () => {
      try {
        const response = await axios.get<TodoItem[]>('/api/todo'); // Adjust the API endpoint if necessary
        setTasks(response.data);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    fetchTasks();
  }, []);

  const startOfMonth = currentDate.startOf('month');
  const endOfMonth = currentDate.endOf('month');
  const startDate = startOfMonth.startOf('week');
  const endDate = endOfMonth.endOf('week');

  const generateDates = () => {
    const dates = [];
    let date = startDate;
    while (date.isBefore(endDate) || date.isSame(endDate, 'day')) {
      dates.push(date);
      date = date.add(1, 'day');
    }
    return dates;
  };

  const dates = generateDates();

  const handlePrevMonth = () => {
    setCurrentDate(currentDate.subtract(1, 'month'));
  };

  const handleNextMonth = () => {
    setCurrentDate(currentDate.add(1, 'month'));
  };

  const isTaskDate = (date: Dayjs) => {
    return tasks.some(task => dayjs(task.createdAt).isSame(date, 'day'));
  };

  const handleDateClick = (date: Dayjs) => {
    setSelectedDate(date);
  };

  const tasksForSelectedDate = selectedDate
    ? tasks.filter(task => dayjs(task.createdAt).isSame(selectedDate, 'day'))
    : [];

  return (
    <div className="container mx-auto p-4 max-w-md shadow-lg rounded-lg bg-white">
      <header className="flex justify-between items-center mb-4">
        <button onClick={handlePrevMonth} className="text-gray-600">
          <FaChevronLeft />
        </button>
        <h1 className="text-lg font-bold">
          {currentDate.format('MMMM YYYY')}
        </h1>
        <button onClick={handleNextMonth} className="text-gray-600">
          <FaChevronRight />
        </button>
      </header>
      <div className="grid grid-cols-7 gap-2 mb-4">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center font-bold">
            {day}
          </div>
        ))}
        {dates.map((date, index) => (
          <div
            key={index}
            className={`p-2 text-center rounded cursor-pointer ${date.month() === currentDate.month() ? (isTaskDate(date) ? 'bg-red-300' : 'bg-blue-100') : 'bg-gray-100'}`}
            onClick={() => handleDateClick(date)}
          >
            {date.date()}
          </div>
        ))}
      </div>
      {selectedDate && (
        <div>
          <h2 className="text-xl font-bold text-center mb-4">
            Tasks for {selectedDate.format('DD MMMM YYYY')}
          </h2>
          {tasksForSelectedDate.length > 0 ? (
            <div className="overflow-y-auto max-h-48"> {/* Added styles for scrollable container */}
              <ul>
                {tasksForSelectedDate.map(task => (
                  <li key={task.id} className="p-2 border-b border-gray-300">
                    <p><strong>Tasks:</strong> {task.todoText}</p>
                    <p><strong>Tags:</strong> {task.tag}</p>
                    <p><strong>Rank:</strong> {task.rank}</p>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p>No tasks for this date.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Calendar;
