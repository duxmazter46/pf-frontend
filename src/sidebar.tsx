import { useEffect, useState } from 'react';
import axios from 'axios';
import { type TodoItem } from './types';
import dayjs from 'dayjs';

const Sidebar = () => {
  const [tags, setTags] = useState<{ [key: string]: number }>({});
  const [todayCount, setTodayCount] = useState(0);
  const [pastCount, setPastCount] = useState(0);

  async function fetchTags() {
    try {
      const res = await axios.get<TodoItem[]>('/api/todo');
      const todos = res.data;

      let todayCount = 0;
      const today = dayjs().startOf('day');

      const tagCount: { [key: string]: number } = {};
      todos.forEach(todo => {
        if (dayjs(todo.createdAt).isSame(today, 'day')) {
          todayCount++;
        }
        if (tagCount[todo.tag]) {
          tagCount[todo.tag]++;
        } else {
          tagCount[todo.tag] = 1;
        }
      });

      setTodayCount(todayCount);
      setPastCount(todos.length - todayCount);
      setTags(tagCount);
    } catch (error) {
      console.error('Failed to fetch todos', error);
    }
  }

  useEffect(() => {
    fetchTags();
  }, []);

  return (
    <div className="min-h-screen w-64 bg-white shadow-md">
      <div className="p-4">
        <div className="mb-4">
        </div>
        <nav>
          <ul className="space-y-2 text-xs">
            <li className="flex items-center">
              Past <span className="ml-auto text-sm text-gray-500">{pastCount}</span>
            </li>
            <li className="flex items-center">
              Today <span className="ml-auto text-sm text-gray-500">{todayCount}</span>
            </li>
          </ul>
        </nav>
        <div className="mt-6">
          <h2 className="font-semibold text-gray-600">My Projects</h2>
          <ul className="space-y-2">
            {Object.entries(tags).map(([tag, count]) => (
              <li key={tag} className="flex items-center text-sm pt-1">
                <span className="mr-2">#</span> {tag} <span className="ml-auto text-sm text-gray-500">{count}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="p-4 border-t mt-auto">
      </div>
    </div>
  );
};

export default Sidebar;
