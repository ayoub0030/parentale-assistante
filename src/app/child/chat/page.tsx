"use client";

import { ChatInterface } from "@/components/chat-interface";

export default function ChildChatPage() {
  return (
    <div className="container mx-auto py-4">
      <h1 className="text-2xl font-bold mb-4 text-green-600">Child Chat</h1>
      <p className="text-gray-600 mb-4">Chat with your assistant .</p>
      <ChatInterface mode="child" />
    </div>
  );
}
