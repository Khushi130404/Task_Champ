import { User } from "../models/User";
import { Task } from "../models/Task";

const TaskUpdate = ({ isOpen, onClose, task }) => {
  const [taskName, setTaskName] = useState(task.name);
  const [level, setLevel] = useState(task.level);

  if (!isOpen) return null;

  return (
    <div>
      <form>
        <input type="text" value={taskname} placeholder="Task Name" required />
        <select value={level}>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
        <button type="submit">Update</button>
        <button type="submit">Cancel</button>
      </form>
    </div>
  );
};

export default TaskUpdate;