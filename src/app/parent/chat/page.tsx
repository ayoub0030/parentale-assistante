"use client";

import { ChatInterface } from "@/components/chat-interface";

export default function ParentChatPage() {
  return (
    <div className="container mx-auto py-4">
      <h1 className="text-2xl font-bold mb-4 text-blue-600">Parent Chat</h1>
      <p className="text-gray-600 mb-4">Chat with your child or get assistance with parenting questions.</p>
      <ChatInterface mode="parent" />
    </div>
  );
}
