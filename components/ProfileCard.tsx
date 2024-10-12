import Image from "next/image";
import { User } from "@prisma/client";

type UserWithVotes = User & {
  totalVotes: number;
};

export default function ProfileCard({ user, rank }: { user: UserWithVotes, rank: number }) {
  const base = "bg-gradient-to-r from-violet-100 to-cyan-200 border-4";
  const flair = rank === 1 ? `${base} border-red-300 bg-opacity-100` : // rank 1
    rank === 2 ? `${base} border-blue-300 bg-opacity-50` : // rank 2
    rank === 3 ? `${base} border-green-300 bg-opacity-25` : // rank 3
    ""; // default flair

  return (
    <div className={`flex flex-col items-center justify-center p-4 border-2 rounded-2xl max-w-[200px] mx-auto ${flair}`}>
      <div className="relative">
        <Image
          src={user.pfpUrl || "/fallbackAvatar.png"}
          className="aspect-square w-full max-w-[200px] h-auto rounded-xl shadow mb-2"
          alt={`${user.username}'s pfp`}
          width={400}
          height={400}
        />
        <Image
          src={`/ribbons/${rank}.png`}
          className="absolute rounded-lg bottom-3 right-1 bg-white/80"
          alt={`Rank ${rank} ribbon`}
          width={30}
          height={30}
        />
      </div>
      <h1 className="mb-2 font-mono text-xl font-bold text-center">{user.username}</h1>
      <p className="text-sm">rank: #{rank}</p>
      <p className="text-sm">votes: {user.totalVotes}</p>
    </div>
  );
}