import { useEffect, useState } from "react";
import { useSocket } from "../context/SocketContext";
import { ActiveUsersListInterface } from "../type";

export default function ActiveUsersList() {
  const socket = useSocket();
  const [users, setUsers] = useState<{ userId: string; userName?: string }[]>(
    []
  );

  useEffect(() => {
    if (!socket) return;

    const handleUsers = (userList: ActiveUsersListInterface[]) =>
      setUsers(userList);

    socket.on("activeUsers", handleUsers);

    return () => {
      socket.off("activeUsers", handleUsers);
    };
  }, [socket]);

  return (
    <div className="border-b-2 border-zinc-700 pb-4">
      <h3 className="text-white text-lg font-semibold flex items-center gap-2 mb-2">
        👥 Active Users
      </h3>
      <ul className="space-y-1 text-sm text-white ml-2">
        {users.map((user) => (
          <li key={user.userId} className="flex items-center gap-2">
            <span className="text-green-400 text-xs">●</span>
            {user.userName || "Anonymous"}
          </li>
        ))}
      </ul>
    </div>
  );
}
