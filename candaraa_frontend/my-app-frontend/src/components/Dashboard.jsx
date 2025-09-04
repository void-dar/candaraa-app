import { useAuthStore } from "../store/useAuthStore";
import WalletCard from "../components/WalletCard";

export default function Dashboard() {
  const { user } = useAuthStore();

  return (
    <div className="dashboard">
      <h1>Welcome, {user?.username}</h1>
      <p>Role: {user?.role}</p>

      <WalletCard />

      {user?.role === "ADMIN" && <p>You have access to admin features.</p>}
    </div>
  );
}
