import { InsightCanvas } from "@/components/canvas/insight-canvas";
import { ChatPanel } from "@/components/chat/chat-panel";

const Home = () => {
  return (
    <div className="flex h-full">
      <main className="relative flex-1 overflow-hidden bg-background">
        <InsightCanvas />
      </main>
      <ChatPanel />
    </div>
  );
};

export default Home;
