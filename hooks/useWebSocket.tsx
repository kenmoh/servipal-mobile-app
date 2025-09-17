// hooks/useWebSocket.ts
import { useEffect, useRef, useState, useCallback } from 'react';
import authStorage from "@/storage/authStorage";

interface UseWebSocketProps {
    onMessage?: (data: any) => void;
    onConnect?: () => void;
    onDisconnect?: () => void;
    onError?: (error: any) => void;
}

interface UseWebSocketReturn {
    isConnected: boolean;
    sendMessage: (message: any) => void;
    reconnect: () => void;
}

export const useWebSocket = ({
    onMessage,
    onConnect,
    onDisconnect,
    onError
}: UseWebSocketProps): UseWebSocketReturn => {
    const [isConnected, setIsConnected] = useState(false);
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
    const reconnectAttemptsRef = useRef(0);
    const maxReconnectAttempts = 5;
    const baseReconnectDelay = 1000;

    const connect = useCallback(async () => {
        try {
            // Replace with your actual WebSocket URL
            const wsUrl = process.env.EXPO_PUBLIC_WS_URL;

            // You might need to add authentication token here
            const token = await authStorage.getToken();
            const urlWithAuth = `${wsUrl}?token=${token}`;

            wsRef.current = new WebSocket(urlWithAuth);

            wsRef.current.onopen = () => {
                setIsConnected(true);
                reconnectAttemptsRef.current = 0;
                onConnect?.();
            };

            wsRef.current.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    onMessage?.(data);
                } catch (error) {
                    console.error('Failed to parse WebSocket message:', error);
                    onError?.(error);
                }
            };

            wsRef.current.onclose = (event) => {
                setIsConnected(false);
                onDisconnect?.();

                // Attempt to reconnect if it wasn't a manual close
                if (event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts) {
                    const delay = baseReconnectDelay * Math.pow(2, reconnectAttemptsRef.current);
                    console.log(`Attempting to reconnect in ${delay}ms (attempt ${reconnectAttemptsRef.current + 1})`);

                    reconnectTimeoutRef.current = setTimeout(() => {
                        reconnectAttemptsRef.current += 1;
                        connect();
                    }, delay);
                }
            };

            wsRef.current.onerror = (error) => {
                console.error('WebSocket error:', error);
                onError?.(error);
            };

        } catch (error) {
            console.error('Failed to create WebSocket connection:', error);
            onError?.(error);
        }
    }, [onMessage, onConnect, onDisconnect, onError]);

    const disconnect = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
        }

        if (wsRef.current) {
            wsRef.current.close(1000, 'Manual disconnect');
            wsRef.current = null;
        }

        setIsConnected(false);
        reconnectAttemptsRef.current = 0;
    }, []);

    const sendMessage = useCallback((message: any) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            try {
                wsRef.current.send(JSON.stringify(message));
            } catch (error) {
                console.error('Failed to send WebSocket message:', error);
                onError?.(error);
            }
        } else {
            console.warn('WebSocket is not connected. Cannot send message.');
        }
    }, [onError]);

    const reconnect = useCallback(() => {
        disconnect();
        setTimeout(connect, 100);
    }, [disconnect, connect]);

    useEffect(() => {
        connect();

        return () => {
            disconnect();
        };
    }, [connect, disconnect]);

    return {
        isConnected,
        sendMessage,
        reconnect,
    };
};

// Optional: Create a WebSocket context for app-wide usage
import React, { createContext, useContext, ReactNode } from 'react';

interface WebSocketContextType {
    isConnected: boolean;
    sendMessage: (message: any) => void;
    reconnect: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const webSocket = useWebSocket({
        onMessage: (data) => {
            // Handle global WebSocket messages here if needed
            console.log('Global WebSocket message:', data);
        },
        onConnect: () => {
            console.log('Global WebSocket connected');
        },
        onDisconnect: () => {
            console.log('Global WebSocket disconnected');
        },
        onError: (error) => {
            console.error('Global WebSocket error:', error);
        },
    });

    return (
        <WebSocketContext.Provider value={webSocket}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocketContext = (): WebSocketContextType => {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error('useWebSocketContext must be used within WebSocketProvider');
    }
    return context;
};
















