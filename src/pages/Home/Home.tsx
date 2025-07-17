import React from "react";
import { HeroSection } from "./components/HeroSection";
import { OnlinePlayers } from "./components/OnlinePlayers";
// import { Leaderboard } from "./components/Leaderboard";
import { TopPlayersLeaderboard } from './components/TopPlayersLeaderboard';
import { QuickActions } from "./components/QuickActions";
import { Stats } from "./components/Stats";
import { TopPlayers } from "./components/TopPlayers";
import "./style.css"

export const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 pb-4">
      <HeroSection />
      
      <div className="mt-3 px-2">
        <TopPlayers />
      </div>

      <div className="mt-2 px-2">
        <OnlinePlayers />
      </div>

      <div className="px-2 mt-4 space-y-4">
        <QuickActions />
        {/* <Stats /> */}
        <TopPlayersLeaderboard />
      </div>
    </div>
  );
};