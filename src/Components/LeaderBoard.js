import React, { useState, useEffect } from "react";
import { ref, get } from "firebase/database";
import { realDb } from "../firebase";
import Navbar from "./Navbar";
import Footer from "./Footer";
import styles from "./LeaderBoard.module.css";
import { getLoggedInUser } from "../FirebaseOperations"; // Import the function
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const LeaderBoard = () => {
  const [users, setUsers] = useState([]);
  const [loggedInUserRank, setLoggedInUserRank] = useState(null);

  useEffect(() => {
    const fetchUsersData = async () => {
      const usersRef = ref(realDb, "users/");
      const snapshot = await get(usersRef);

      if (snapshot.exists()) {
        const usersData = snapshot.val();

        const leaderboardData = Object.keys(usersData).map((userId) => {
          const user = usersData[userId];
          const completedTasks = Object.values(user.tasks || {}).filter(
            (task) => task.is_done === true
          ).length;

          const score = Object.values(user.tasks || {}).reduce(
            (total, task) => (task.is_done ? total + task.priority : total),
            0
          );

          return {
            userId, // User ID from Firebase
            username: user.username,
            completedTasks,
            score,
          };
        });

        // Sort leaderboard by score, then by completed tasks
        leaderboardData.sort(
          (a, b) => b.score - a.score || b.completedTasks - a.completedTasks
        );

        // Get the logged-in user information
        const loggedInUser = localStorage.getItem("userId");

        if (loggedInUser) {
          const userRank = leaderboardData.find(
            (user) => user.userId === loggedInUser
          );
          if (userRank) {
            setLoggedInUserRank({
              ...userRank,
              rank: leaderboardData.indexOf(userRank) + 1,
            });
          }
        }

        console.log("Leaderboard Data:", leaderboardData);
        setUsers(leaderboardData);
      }
    };

    fetchUsersData();
  }, []);

  const getReward = (index) => {
    switch (index) {
      case 0:
        return <span className="text-gray-300">🏆 Gold Medal</span>;
      case 1:
        return <span className="text-gray-300">🥈 Silver Medal</span>;
      case 2:
        return <span className="text-gray-300">🥉 Bronze Medal</span>;
      default:
        return <span className="text-gray-300">🎖 participant</span>;
    }
  };

  return (
    <div>
      <div>
        <div className={styles.navbar}>
          <Navbar />
        </div>
        <div
          className={`container mx-auto ${styles.leader_outer}`}
          style={{ paddingLeft: "250px" }}
        >
          <div className={`px-20 py-8 w-[100%] ${styles.leader_inner}`}>
            <h1 className={styles.heading}>LeaderBoard</h1>
            <h1 className={styles.heading}>LeaderBoard</h1>
            {/* Logged-in User's Rank */}
            {loggedInUserRank ? (
              <div
                className={`bg-white shadow-lg rounded-lg mb-10 ${styles.rank_outer}`}
              >
                <div className={`p-4 ${styles.rank_inner}`}>
                  <h2 className="text-xl font-bold text-white mb-1">
                    Your Rank : {loggedInUserRank.rank}
                  </h2>
                  <p className="text-gray-400 text-lg font-semibold">
                    Username : {loggedInUserRank.username}
                  </p>
                  <p className="text-gray-400 text-lg font-semibold">
                    Tasks Completed : {loggedInUserRank.completedTasks}
                  </p>
                  <p className="text-gray-400 text-lg font-semibold">
                    Score : {loggedInUserRank.score}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white shadow-lg rounded-lg p-4 mb-12">
                <h2 className="text-xl font-bold mb-2">Your Rank : N/A</h2>
                <p className="text-gray-600 text-sm">
                  Could not find your data in the leaderboard.
                </p>
              </div>
            )}
            {/* Top 3 Contributors */}
            <div className={`grid grid-cols-1 sm:grid-cols-3 gap-10 mb-12`}>
              {users.slice(0, 3).map((user, index) => (
                <div
                  key={user.userId}
                  className={`shadow-xl text-sm rounded-2xl flex flex-col mr-4 items-center hover:cursor-pointer 
            transition-transform duration-1000 hover:scale-105 ${
              index === 0
                ? "border-t-4 border-[#9793ba]"
                : index === 1
                ? "border-t-4 border-[#9793ba]"
                : "border-t-4 border-[#9793ba]"
            } ${styles.rank_board_outer}`}
                >
                  <div className={`${styles.rank_board_inner} p-5`}>
                    <h2 className="text-lg text-white font-bold mb-1">
                      {user.username}
                    </h2>
                    <p className="text-gray-400 font-semibold">
                      Tasks Completed: {user.completedTasks}
                    </p>
                    <p className="text-gray-400 font-semibold">
                      Score: {user.score}
                    </p>
                    <div className="mt-3 font-semibold">{getReward(index)}</div>
                  </div>
                </div>
              ))}
            </div>
            {/* Leaderboard Table for the rest */}
            <div className={styles.leader_board_outer}>
              <div className={`overflow-y-auto ${styles.leader_board_inner}`}>
                <table className="min-w-full border-gray-400 shadow-md rounded-lg overflow-hidden hover:cursor-pointer">
                  <thead
                    className={`text-md sticky top-0 z-10 font-bold ${styles.table_head}`}
                  >
                    <tr>
                      <th className="px-5 py-5 text-left">Rank</th>
                      <th className="px-5 text-left">Username</th>
                      {/* <th className="px-4 text-left">User ID</th> */}
                      <th className="px-5 text-left">Completed Tasks</th>
                      <th className="px-5 text-left">Score</th>
                      <th className="px-5 text-left">Reward</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, index) => (
                      <tr
                        key={user.userId}
                        className={`hover:bg-g hover:cursor-pointer text-sm duration-300 ${
                          user.userId === loggedInUserRank?.userId
                            ? "bg-transparent"
                            : "bg-transparent"
                        } ${styles.leader_table_li}`} // Highlight logged-in user's row
                      >
                        <td className="px-7 py-3 text-gray-300">{index + 1}</td>
                        <td className="py-2 px-5 text-gray-300 hover:scale-105">
                          {user.username}
                        </td>
                        {/* <td className="p-2 text-gray-300">{user.userId}</td> */}
                        <td className="px-16 text-gray-300">
                          {user.completedTasks}
                        </td>
                        <td className="px-6 text-gray-300">{user.score}</td>
                        <td className="py-2 px-4 text-gray-300">
                          {getReward(index)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {/* Display the performance graph */}
            <h2 className="text-3xl text-center text-[#9793ba] mt-16 font-bold">
              Weekly Performance Comparison (Top 10 Users)
            </h2>
            <ResponsiveContainer
              width="100%"
              height={400}
              className="mt-4 mb-3 transition-opacity duration-500 opacity-100 hover:opacity-80 text-black"
            >
              <LineChart
                data={users.slice(0, 10)} // Show only the top 5 users
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="username" className="text-black text-sm" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#8B5DFF"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="completedTasks"
                  stroke="#9793ba"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <Footer></Footer>
      </div>
    </div>
  );
};

export default LeaderBoard;
