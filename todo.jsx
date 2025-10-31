import { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import "./Todo.css";
import {
    getTodos,
    addTodo,
    updateTodo,
    deleteTodo,
} from "./Apis.js";
import Swal from "sweetalert2";


export default function Todo() {
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState("");
    const [search, setSearch] = useState("");

    useEffect(() => {
        AOS.init({ duration: 1000, once: false });
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const data = await getTodos();
            setTasks(data);
        } catch (error) {
            Swal.fire({
                icon: "Error",
                title: "Error fetching todos:",
                text: { error },
            });
            Swal.fire("Error", "Failed to load tasks.", "error");
        }
    };

    const handleAddTask = async () => {
        const trimmed = newTask.trim();
        if (!trimmed) {
            Swal.fire({
                icon: "warning",
                title: "Empty Task!",
                text: "Please enter a task before adding.",
            });
            return;
        }
        try {
            const newTodo = await addTodo(trimmed);
            setTasks([...tasks, newTodo]);
            setNewTask("");
        } catch (error) {
            Swal.fire("Error", "Error adding task", "error");
        }
    };

    const toggleComplete = async (id, completed) => {
        try {
            const updated = await updateTodo(id, { completed: !completed });
            setTasks(tasks.map((t) => (t._id === id ? updated : t)));
        } catch (error) {
            Swal.fire("Error", "Error updating task", "error");
        }
    };

    const handleDelete = async (id) => {
        try {
            Swal.fire({
                title: "Are you sure?",
                text: "This task will be deleted permanently.",
                icon: "warning",
                showCancelButton: true,
                background: "#000000ff",
                color: "#fcfcfcff",
                confirmButtonColor: "#d33",
                cancelButtonColor: "#464646ff",
                confirmButtonText: "Yes, delete it!"
            }).then(async (result) => {
                if (result.isConfirmed) {
                    await deleteTodo(id);
                    setTasks(tasks.filter((t) => t._id !== id));
                    Swal.fire("Deleted!", "Your task has been deleted.", "success");
                }
            });
        } catch (error) {
            Swal.fire("Error", "Error deleting task", "error");
        }
    };

    const handleEdit = async (todo) => {
        const { value: newTitle } = await Swal.fire({
            title: "Edit Task",
            input: "text",
            inputValue: todo.title,
            showCancelButton: true,
            confirmButtonText: "Update",
            inputValidator: (value) => {
                if (!value.trim()) {
                    return "Task cannot be empty!";
                }
            },
        });

        if (newTitle) {
            try {
                const updated = await updateTodo(todo._id, { title: newTitle });
                setTasks(tasks.map((t) => (t._id === todo._id ? updated : t)));
                Swal.fire("Updated!", "Your task has been updated.", "success");
            } catch (error) {
                Swal.fire("Error", "Failed to update task.", "error");
            }
        }
    };

    const handleDeleteAll = async () => {
        if (tasks.length === 0) return;

        Swal.fire({
            title: "Delete all tasks?",
            text: "This will remove all your to-dos.",
            icon: "warning",
            showCancelButton: true,
            background: "#000000ff",
            color: "#fcfcfcff",
            confirmButtonColor: "#d33",
            cancelButtonColor: "#464646ff",
            confirmButtonText: "Yes, delete all!"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    for (let t of tasks) {
                        await deleteTodo(t._id);
                    }
                    setTasks([]);
                    Swal.fire("Deleted!", "All tasks have been removed.", "success");
                } catch (error) {
                    Swal.fire("Error", "Something went wrong while deleting.", "error");
                }
            }
        });
    };

    const filteredTasks = tasks.filter((t) =>
        t.title.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="container" data-aos="fade-up">
            <h1 data-aos="zoom-in-up" data-aos-delay="600">
                To-do List
            </h1>

            <input
                id="search"
                type="text"
                placeholder="Search tasks"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                data-aos="zoom-in-left"
                data-aos-delay="700"
                className="border p-2 w-full mb-4"
            />

            <h1 data-aos="zoom-in-up" data-aos-delay="800" className="text-xl mb-2">
                Add a new Task
            </h1>

            <input
                id="inp"
                type="text"
                placeholder="Enter your task here"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
                data-aos="zoom-in-left"
                data-aos-delay="900"
                className="border p-2 flex-1"
            />
            <button
                onClick={handleAddTask}
                data-aos="fade-up"
                data-aos-delay="1000"
                className="submit"
            >
                Submit
            </button>

            <button
                onClick={handleDeleteAll}
                data-aos="fade-up"
                data-aos-delay="1100"
                className="submit"
                style={{
                    backgroundColor: tasks.length ? "rgb(14,13,13)" : "rgb(180,180,180)",
                    color: "white",
                }}
                disabled={tasks.length === 0}
            >
                Delete All
            </button>

            <ul id="list" data-aos="zoom-in-up" data-aos-delay="1300">
                {filteredTasks.length === 0 ? (
                    <p>No tasks yet!</p>
                ) : (
                    filteredTasks.map((t) => (
                        <li key={t._id} className="pira">
                            <div className={`task-text ${t.completed ? "completed" : ""}`}>
                                {t.title}
                            </div>
                            <div className="task-actions">
                                <input
                                    type="checkbox"
                                    checked={t.completed}
                                    onChange={() => toggleComplete(t._id, t.completed)}
                                />
                                <button onClick={() => handleDelete(t._id)}>🗑️</button>
                                <button onClick={() => handleEdit(t)}>✏️</button>
                            </div>
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
}
