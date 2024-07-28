import { useEffect, useState } from "react";
import axios from "axios";
import { type TodoItem } from "./types";
import dayjs from "dayjs";
import { FaPlus, FaFlag, FaTrash, FaEdit } from 'react-icons/fa';

function App() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [inputText, setInputText] = useState("");
  const [tag, setTag] = useState("general");
  const [rank, setRank] = useState("0");

  const [mode, setMode] = useState<"ADD" | "EDIT">("ADD");
  const [curTodoId, setCurTodoId] = useState("");

  async function fetchData() {
    const res = await axios.get<TodoItem[]>("api/todo");
    setTodos(res.data);
  }

  useEffect(() => {
    fetchData();
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInputText(e.target.value);
  }

  function handleTagChange(newTag: string) {
    setTag(newTag);
  }

  function handleRankChange(e: React.ChangeEvent<HTMLInputElement>) {
    setRank(e.target.value);
  }

  function handleSubmit() {
    if (!inputText) return;
    if (mode === "ADD") {
      axios
        .request({
          url: "/api/todo",
          method: "put",
          data: { todoText: inputText, tag, rank },
        })
        .then(() => {
          setInputText("");
          setTag("general");
          setRank("0");
        })
        .then(fetchData)
        .then(() => window.location.reload())
        .catch((err) => alert(err));
    } else {
      axios
        .request({
          url: "/api/todo",
          method: "patch",
          data: { id: curTodoId, todoText: inputText, tag, rank },
        })
        .then(() => {
          setInputText("");
          setTag("general");
          setRank("0");
          setMode("ADD");
          setCurTodoId("");
        })
        .then(fetchData)
        .then(() => window.location.reload())
        .catch((err) => alert(err));
    }
  }

  function handleDelete(id: string) {
    axios
      .delete("/api/todo", { data: { id } })
      .then(fetchData)
      .then(() => {
        setMode("ADD");
        setInputText("");
        setTag("general");
        setRank("0");
      })
      .then(() => window.location.reload())
      .catch((err) => alert(err));
  }

  function handleCancel() {
    setMode("ADD");
    setInputText("");
    setTag("general");
    setRank("0");
    setCurTodoId("");
  }

  return (
    <div className="container min-h-screen mr-auto p-4 max-w-lg shadow-lg rounded-lg bg-white">
      <header>
        <h1 className="text-2xl font-bold text-center mb-4">Todo App</h1>
      </header>
      <div className="p-1 block text-gray-800 font-semibold text-sm">#{tag} </div>
      <main>
        <div className="input-container flex flex-col gap-4 mb-4 border border-gray-300 rounded">
          <input
            type="text"
            onChange={handleChange}
            value={inputText}
            placeholder="Task name"
            className="input-text p-2 text-sm focus:outline-none focus:ring-0"
            data-cy="input-text"
          />
          <div className="flex p-2 space-x-2">
            {["general", "project", "work", "routine"].map((t) => (
              <button
                key={t}
                onClick={() => handleTagChange(t)}
                className={`text-xs p-2 rounded-full border border-gray-300 px-2 py-1 hover:scale-105 ${tag === t ? "bg-[#3f3f3f] text-white" : ""}`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 p-2">
            <label htmlFor="rank" className="text-gray-700 text-xs">Priority:</label>
            <input
              type="range"
              id="rank"
              name="rank"
              min="0"
              max="2"
              step="1"
              value={rank}
              onChange={handleRankChange}
              className="range-slider"
              data-cy="select-rank"
            />
            <span className="text-gray-700 text-xs">{rank}</span><FaFlag className="opacity-20 text-xs " />
          </div>
        </div>
        <div className="pb-2 flex flex-row-reverse">
          <button onClick={handleSubmit} className="submit-button flex flex-row bg-[#c46060] text-white text-xs px-1 py-1 rounded" data-cy="submit">
            {mode === "ADD" ? <><FaPlus className="pt-1" /> Submit</> : "Update"}
          </button>
          {mode === "EDIT" && (
            <button onClick={handleCancel} className="cancel-button bg-gray-500 text-white px-1 py-1 rounded">
              Cancel
            </button>
          )}
        </div>
        <div data-cy="todo-item-wrapper" className="todo-item-wrapper flex flex-col gap-4 overflow-y-auto max-h-96">
          {todos.sort(compareDate).map((item, idx) => {
            const { date, time } = formatDateTime(item.createdAt);
            const text = item.todoText;

            return (
              <article
                key={item.id}
                className="todo-item p-4 border border-gray-300 rounded flex justify-between items-center"
              >
                <div>{idx + 1}</div>
                <div data-cy='todo-item-text' className="text-sm">{text}</div>
                <div className="flex flex-col flex-initial p-1 text-xs">
                  <div>#{item.tag}</div>
                  <div>Priority : {item.rank}</div>
                  <div>Date: {date}</div>
                  <div>Time: {time}</div>
                </div>
                <div
                  className="update-button cursor-pointer"
                  onClick={() => {
                    setMode("EDIT");
                    setCurTodoId(item.id);
                    setInputText(item.todoText);
                    setTag(item.tag);
                    setRank(item.rank.toString()); // Convert rank to string
                  }}
                  data-cy="todo-item-update"
                >
                  {curTodoId !== item.id ? <FaEdit className="text-ml hover:scale-105" /> : "✍🏻"}
                </div>
                {mode === "ADD" && (
                  <div
                    className="delete-button cursor-pointer"
                    onClick={() => handleDelete(item.id)}
                    data-cy='todo-item-delete'
                  >
                    <FaTrash className="text-sm hover:scale-105" />
                  </div>
                )}
              </article>
            );
            ////
          })}
        </div>
      </main>
    </div>
  );
}

export default App;

function formatDateTime(dateStr: string) {
  if (!dayjs(dateStr).isValid()) {
    return { date: "N/A", time: "N/A" };
  }
  const dt = dayjs(dateStr);
  const date = dt.format("D/MM/YY");
  const time = dt.format("HH:mm");
  return { date, time };
}

function compareDate(a: TodoItem, b: TodoItem) {
  const da = dayjs(a.createdAt);
  const db = dayjs(b.createdAt);
  return da.isBefore(db) ? -1 : 1;
}
