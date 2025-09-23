import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useWebSocket } from "@/hooks/use-websocket";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, MessageCircle, Users } from "lucide-react";

interface ChatMessage {
  type: string;
  username?: string;
  message?: string;
  timestamp?: number;
}

export default function Chat() {
  const [message, setMessage] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { messages, connected, sendMessage } = useWebSocket();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || !user || !connected) return;
    
    sendMessage(message.trim(), user.username);
    setMessage("");
  };

  const formatTime = (timestamp?: number) => {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const chatMessages = messages.filter(msg => msg.type === 'chat');
  const onlineUsers = new Set(chatMessages.slice(-50).map(msg => msg.username).filter(Boolean));

  return (
    <Card className={`transition-all duration-300 ${isExpanded ? 'fixed inset-4 z-50' : ''}`} data-testid="chat-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            <CardTitle className="font-impact text-xl text-primary">💬 GLOBAL CHAT</CardTitle>
            <Badge variant="secondary" className="text-xs">
              <Users className="w-3 h-3 mr-1" />
              {onlineUsers.size}
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={connected ? "default" : "destructive"} className="text-xs">
              {connected ? "🟢 Connected" : "🔴 Disconnected"}
            </Badge>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsExpanded(!isExpanded)}
              data-testid="button-toggle-chat"
            >
              {isExpanded ? "📱" : "🔍"}
            </Button>
          </div>
        </div>
        {!isExpanded && (
          <CardDescription>
            Chat with fellow meme enthusiasts
          </CardDescription>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Messages Area */}
        <div 
          className={`bg-muted rounded-lg p-4 overflow-y-auto space-y-3 ${
            isExpanded ? 'h-96' : 'h-48'
          }`}
          data-testid="chat-messages"
        >
          {!connected && (
            <div className="text-center text-muted-foreground py-4">
              <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Connecting to chat...</p>
            </div>
          )}
          
          {connected && chatMessages.length === 0 && (
            <div className="text-center text-muted-foreground py-4">
              <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No messages yet. Start the conversation! 💬</p>
            </div>
          )}
          
          {chatMessages.map((msg, index) => (
            <div 
              key={`${msg.username}-${msg.timestamp}-${index}`} 
              className={`flex items-start space-x-3 ${
                msg.username === user?.username ? 'flex-row-reverse space-x-reverse' : ''
              }`}
              data-testid={`chat-message-${index}`}
            >
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarFallback className={`text-sm font-bold ${
                  msg.username === user?.username ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                }`}>
                  {msg.username?.[0]?.toUpperCase() || '?'}
                </AvatarFallback>
              </Avatar>
              
              <div className={`flex-1 max-w-xs ${
                msg.username === user?.username ? 'text-right' : ''
              }`}>
                <div className="flex items-center space-x-2 mb-1">
                  <span className={`font-bold text-sm ${
                    msg.username === user?.username 
                      ? 'text-primary' 
                      : ['text-secondary', 'text-accent', 'text-green-500', 'text-blue-500', 'text-purple-500'][
                          (msg.username?.charCodeAt(0) || 0) % 5
                        ]
                  }`}>
                    {msg.username}
                    {msg.username === user?.username && (
                      <Badge variant="outline" className="ml-1 text-xs">YOU</Badge>
                    )}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
                <div className={`p-2 rounded-lg text-sm break-words ${
                  msg.username === user?.username
                    ? 'bg-primary text-primary-foreground ml-auto'
                    : 'bg-background border'
                }`}>
                  {msg.message}
                </div>
              </div>
            </div>
          ))}
          
          {/* System Messages */}
          {messages.filter(msg => msg.type === 'system').slice(-3).map((msg, index) => (
            <div 
              key={`system-${msg.timestamp}-${index}`}
              className="text-center py-2"
            >
              <Badge variant="secondary" className="text-xs">
                ℹ️ {msg.message}
              </Badge>
            </div>
          ))}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={connected ? "Type your message..." : "Connecting..."}
            disabled={!connected || !user}
            maxLength={200}
            className="flex-1"
            data-testid="input-chat-message"
          />
          <Button
            type="submit"
            size="sm"
            disabled={!message.trim() || !connected || !user}
            className="px-3"
            data-testid="button-send-message"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
        
        {/* Chat Rules */}
        {isExpanded && (
          <div className="text-xs text-muted-foreground space-y-1 mt-4 p-3 bg-muted/50 rounded">
            <p><strong>Chat Rules:</strong></p>
            <p>• Be respectful to other players</p>
            <p>• No spam or excessive caps</p>
            <p>• Keep it meme-related and fun! 🎉</p>
            <p>• Messages are limited to 200 characters</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
