/// <reference types="vite/client" />

interface EchoChannel {
    listen(event: string, callback: (data: any) => void): EchoChannel;
    listenForWhisper(event: string, callback: (data: any) => void): EchoChannel;
    whisper(event: string, data: any): EchoChannel;
    stopListening(event: string): EchoChannel;
    unsubscribe(): void;
}

interface EchoInstance {
    private(channel: string): EchoChannel;
    join(channel: string): EchoChannel;
    leave(channel: string): void;
    socketId(): string | undefined;
}

interface Window {
    Echo: EchoInstance;
    Pusher: any;
}
