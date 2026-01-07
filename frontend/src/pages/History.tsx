import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MessageSquare, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/contexts/WalletContext";
import { API_CONFIG } from "@/config/api";
import { format } from "date-fns";

type Conversation = {
  id: string;
  title: string;
  updated_at: string;
};

const History = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { walletAddress, isConnected } = useWallet();

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    // Load from backend if wallet is connected
    if (isConnected && walletAddress) {
      try {
        const response = await fetch(`${API_CONFIG.BACKEND_URL}/chat/history?wallet_address=${walletAddress}`, {
          headers: {
            'Authorization': `Wallet ${walletAddress}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setConversations(data.conversations || []);
          return;
        }
      } catch (error) {
        console.error('Failed to load from backend:', error);
      }
    }
    
    // Fallback to Supabase
    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) {
      toast({ title: "Error loading conversations", variant: "destructive" });
      return;
    }

    setConversations(data || []);
  };

  const deleteConversation = async (id: string) => {
    const { error } = await supabase.from("conversations").delete().eq("id", id);

    if (error) {
      toast({ title: "Error deleting conversation", variant: "destructive" });
      return;
    }

    toast({ title: "Conversation deleted" });
    loadConversations();
  };

  const clearAllHistory = async () => {
    const { error } = await supabase.from("conversations").delete().neq("id", "");

    if (error) {
      toast({ title: "Error clearing history", variant: "destructive" });
      return;
    }

    toast({ title: "All conversations cleared" });
    setConversations([]);
    setShowClearDialog(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <div className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Chat History</h1>
            {!isConnected && (
              <p className="text-sm text-muted-foreground mt-1">
                Connect your wallet to access cross-platform chat history
              </p>
            )}
          </div>
          <Button 
            variant="destructive" 
            onClick={() => setShowClearDialog(true)}
            disabled={conversations.length === 0}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear History
          </Button>
        </div>

        <ScrollArea className="h-[calc(100vh-200px)]">
          {conversations.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No conversations yet</p>
              <p className="text-sm mt-2">Start a new chat to begin</p>
            </div>
          ) : (
            <div className="space-y-3">
              {conversations.map((conv) => (
                <Card
                  key={conv.id}
                  className="p-4 hover:bg-accent/50 transition-colors cursor-pointer group"
                  onClick={() => navigate(`/chat?id=${conv.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <MessageSquare className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{conv.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(conv.updated_at), "PPp")}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteConversation(conv.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>

        <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clear all chat history?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete all your conversations. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={clearAllHistory} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Clear All
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default History;