import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, History, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/contexts/WalletContext";
import { API_CONFIG } from "@/config/api";

type Message = { role: "user" | "assistant"; content: string };

const Chat = () => {
  const [searchParams] = useSearchParams();
  const conversationId = searchParams.get("id");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { walletAddress, isConnected } = useWallet();

  useEffect(() => {
    if (conversationId) {
      // Only load conversation if we don't already have messages
      // This prevents overwriting messages that were just added
      if (messages.length === 0) {
        loadConversation(conversationId);
      }
    }
  }, [conversationId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadConversation = async (id: string) => {
    // Try loading from backend if wallet is connected
    if (isConnected && walletAddress) {
      try {
        const response = await fetch(`${API_CONFIG.BACKEND_URL}/chat/conversation/${id}?wallet_address=${walletAddress}`, {
          headers: {
            'Authorization': `Wallet ${walletAddress}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          const loadedMessages = data.messages.map((m: any) => ({ 
            role: m.role as "user" | "assistant", 
            content: m.content 
          }));
          
          setMessages((prev) => {
            if (prev.length === 0) {
              return loadedMessages;
            }
            const merged = [...prev];
            loadedMessages.forEach((loadedMsg: any) => {
              const exists = merged.some(
                (m) => m.role === loadedMsg.role && m.content === loadedMsg.content
              );
              if (!exists) {
                merged.push(loadedMsg);
              }
            });
            return merged;
          });
          return;
        }
      } catch (error) {
        console.error('Failed to load from backend:', error);
      }
    }
    
    // Fallback to Supabase
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", id)
      .order("created_at");

    if (error) {
      toast({ title: "Error loading conversation", variant: "destructive" });
      return;
    }

    const loadedMessages = data.map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));
    
    // Merge with existing messages to avoid losing any that were just added
    setMessages((prev) => {
      if (prev.length === 0) {
        return loadedMessages;
      }
      // If we have existing messages, merge them with loaded ones, avoiding duplicates
      const merged = [...prev];
      loadedMessages.forEach((loadedMsg) => {
        const exists = merged.some(
          (m) => m.role === loadedMsg.role && m.content === loadedMsg.content
        );
        if (!exists) {
          merged.push(loadedMsg);
        }
      });
      // Sort by order (user messages should come before their responses)
      return merged;
    });
  };

  const saveMessage = async (convId: string, role: string, content: string) => {
    // Save to Supabase for backward compatibility
    await supabase.from("messages").insert({
      conversation_id: convId,
      role,
      content,
    }).catch(() => {
      // Ignore Supabase errors if using wallet-based storage
    });
    
    // Also save to backend if wallet is connected
    if (isConnected && walletAddress) {
      try {
        await fetch(`${API_CONFIG.BACKEND_URL}/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Wallet ${walletAddress}`,
          },
          body: JSON.stringify({
            messages: [{ role, content }],
            conversation_id: convId,
            wallet_address: walletAddress,
          }),
        });
      } catch (error) {
        console.error('Failed to save to backend:', error);
      }
    }
  };

  const sendMessageWithText = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: messageText };
    // Add user message to state immediately so it's visible
    setMessages((prev) => {
      // Check if message already exists to avoid duplicates
      const exists = prev.some(m => m.role === "user" && m.content === messageText);
      return exists ? prev : [...prev, userMessage];
    });
    setIsLoading(true);

    let currentConvId = conversationId;

    // Create new conversation if needed
    if (!currentConvId) {
      const { data, error } = await supabase
        .from("conversations")
        .insert({ title: messageText.slice(0, 50) })
        .select()
        .single();

      if (error || !data) {
        toast({ title: "Error creating conversation", variant: "destructive" });
        setIsLoading(false);
        return;
      }

      currentConvId = data.id;
      // Save message before navigating to ensure it's persisted
      await saveMessage(currentConvId, "user", messageText);
      // Update conversationId state and navigate
      navigate(`/chat?id=${currentConvId}`, { replace: true });
    } else {
      // Save message if conversation already exists
      await saveMessage(currentConvId, "user", messageText);
    }

    try {
      // Call backend chat endpoint
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      
      // Add wallet address if connected
      if (isConnected && walletAddress) {
        headers['Authorization'] = `Wallet ${walletAddress}`;
      }
      
      const response = await fetch(`${API_CONFIG.BACKEND_URL}/chat`, {
        method: "POST",
        headers,
        body: JSON.stringify({ 
          messages: [...messages, userMessage],
          conversation_id: currentConvId,
          wallet_address: walletAddress,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast({ title: errorData.error || "Error getting response", variant: "destructive" });
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      const assistantContent = data.choices?.[0]?.delta?.content || "I could not respond.";
      
      // Update conversation ID if returned from backend
      if (data.conversation_id && !currentConvId) {
        currentConvId = data.conversation_id;
        navigate(`/chat?id=${currentConvId}`, { replace: true });
      }

      // Add assistant response to messages
      setMessages((prev) => [...prev, { role: "assistant", content: assistantContent }]);

      if (assistantContent && currentConvId) {
        await saveMessage(currentConvId, "assistant", assistantContent);
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast({ title: "Error sending message", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const messageText = input;
    setInput("");
    await sendMessageWithText(messageText);
  };

  // Check for initial message from home page (after sendMessageWithText is defined)
  useEffect(() => {
    // Only check for initial message if we don't have a conversation ID and no messages
    if (!conversationId && messages.length === 0) {
      const initialMessage = sessionStorage.getItem('initialChatMessage');
      if (initialMessage) {
        // Remove it immediately to prevent duplicate sends
        sessionStorage.removeItem('initialChatMessage');
        // Auto-send the message after component is fully mounted
        const timer = setTimeout(() => {
          sendMessageWithText(initialMessage);
        }, 500);
        return () => clearTimeout(timer);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <div className="flex-1 container mx-auto px-4 py-8 flex flex-col max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-foreground">NexaHealth AI Assistant</h1>
          <Button variant="outline" onClick={() => navigate("/history")}>
            <History className="h-4 w-4 mr-2" />
            View History
          </Button>
        </div>

        <ScrollArea className="flex-1 border rounded-lg bg-card dark:bg-card p-4 mb-4">
          <div className="space-y-4 min-h-[400px]">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground dark:text-muted-foreground py-12">
                <p className="text-lg">Start a conversation with NexaHealth AI</p>
                <p className="text-sm mt-2">Ask about symptoms, health concerns, or medical information</p>
              </div>
            )}
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-3 shadow-sm ${
                    msg.role === "user"
                      ? "bg-primary text-white dark:bg-primary dark:text-white"
                      : "bg-muted text-foreground dark:bg-muted dark:text-foreground border border-border/50 dark:border-border"
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                </div>
              </div>
            ))}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Type your message here..."
            className="resize-none"
            rows={3}
            disabled={isLoading}
          />
          <Button onClick={sendMessage} disabled={isLoading || !input.trim()} size="icon" className="h-auto">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Chat;