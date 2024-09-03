import React, { useState, useEffect } from "react";
import { User } from "../models/User";
import { Task } from "../models/Task";
import TaskItem from "./TaskItem";
import { ref, set, get } from "firebase/database";
import { realDb } from "../firebase";

const TaskList = ({ userId }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  function updatePriorities(temp) {
    const updatedTasks = temp.map((task, index) => ({
      ...task,
      priority: index + 1,
    }));
    setTasks(updatedTasks);
    updatedTasks.forEach(async (task) => {
      const taskRef = ref(realDb, `users/${userId}/tasks/${task.taskId}`);
      return set(taskRef, {
        date: task.date,
        taskname: task.taskname,
        level: task.level,
        is_done: task.is_done,
        priority: task.priority,
      });
    });
  }

  function deleteList(index) {
    const temp = [...tasks];
    temp.splice(index, 1);
    updatePriorities(temp);
  }

  function upList(index) {
    if (index > 0) {
      const temp = [...tasks];
      [temp[index], temp[index - 1]] = [temp[index - 1], temp[index]];
      updatePriorities(temp);
    }
  }

  function downList(index) {
    if (index < tasks.length - 1) {
      const temp = [...tasks];
      [temp[index], temp[index + 1]] = [temp[index + 1], temp[index]];
      updatePriorities(temp);
    }
  }

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const user = await User.fetch(userId);
        const tasksArray = Object.keys(user.tasks).map((taskId) => {
          const taskData = user.tasks[taskId];
          return new Task(
            taskId,
            taskData.date,
            taskData.taskname,
            taskData.level,
            taskData.is_done,
            taskData.priority
          );
        });
        //console.log("Fetched tasks:", tasksArray);
        tasksArray.sort((a, b) => a.priority - b.priority);
        setTasks(tasksArray);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [userId]);

  if (loading) return <div>Loading tasks...</div>;

  if (!tasks.length) return <div>No tasks available</div>;

  return (
    <div>
      <h1>My Tasks</h1>
      {tasks.map((task, index) => (
        <TaskItem
          key={index}
          task={task}
          userId={userId}
          upList={upList}
          downList={downList}
          deleteList={deleteList}
        />
      ))}
    </div>
  );
};

export default TaskList;