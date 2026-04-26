import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 3000;

// Serve static files from src directory
app.use(express.static(path.join(__dirname, 'src')));

// Game state
const gameState = {
    players: new Map(),
    world: null
};

// WebSocket connection handler
wss.on('connection', (ws) => {
    const playerId = Math.random().toString(36).substr(2, 9);
    
    console.log(`[Server] Player connected: ${playerId}`);
    
    // Send welcome message
    ws.send(JSON.stringify({
        type: 'welcome',
        playerId: playerId,
        gameState: gameState
    }));
    
    // Store player connection
    gameState.players.set(playerId, {
        id: playerId,
        ws: ws,
        x: 5,
        y: 5
    });
    
    // Broadcast player joined
    broadcastToAll({
        type: 'playerJoined',
        playerId: playerId
    });
    
    ws.on('message', (data) => {
        try {
            const message = JSON.parse(data);
            handleMessage(playerId, message);
        } catch (error) {
            console.error('[Server] Error parsing message:', error);
        }
    });
    
    ws.on('close', () => {
        console.log(`[Server] Player disconnected: ${playerId}`);
        gameState.players.delete(playerId);
        
        broadcastToAll({
            type: 'playerLeft',
            playerId: playerId
        });
    });
});

function handleMessage(playerId, message) {
    const player = gameState.players.get(playerId);
    if (!player) return;
    
    switch (message.type) {
        case 'playerMove':
            player.x = message.x;
            player.y = message.y;
            broadcastToAll({
                type: 'playerMoved',
                playerId: playerId,
                x: player.x,
                y: player.y
            });
            break;
            
        case 'tileUpdate':
            // Handle tile updates from players
            if (gameState.world && message.x !== undefined && message.y !== undefined) {
                if (!gameState.world.data.tiles[message.y]) {
                    gameState.world.data.tiles[message.y] = [];
                }
                gameState.world.data.tiles[message.y][message.x] = message.tileId;
                
                broadcastToAll({
                    type: 'tileChanged',
                    x: message.x,
                    y: message.y,
                    tileId: message.tileId
                });
            }
            break;
    }
}

function broadcastToAll(message) {
    const data = JSON.stringify(message);
    wss.clients.forEach((client) => {
        if (client.readyState === 1) { // WebSocket.OPEN
            client.send(data);
        }
    });
}

server.listen(PORT, () => {
    console.log(`[Server] Velora multiplayer server running on http://localhost:${PORT}`);
    console.log(`[Server] WebSocket server ready for connections`);
});
