import { Server as NetServer } from 'http';
import { NextApiRequest, NextApiResponse } from 'next';
import { Server as ServerIO } from 'socket.io';

export const config = {
  api: {
    bodyParser: false,
  },
};

const SocketHandler = (req: NextApiRequest, res: NextApiResponse & { socket: any }) => {
  if (res.socket.server.io) {
    console.log('Socket is already running');
  } else {
    console.log('Socket is initializing');
    const httpServer: NetServer = res.socket.server as any;
    const io = new ServerIO(httpServer, {
      path: '/api/socket/io',
      addTrailingSlash: false,
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    io.use((socket, next) => {
      const tenantId = socket.handshake.auth.tenantId;
      
      if (!tenantId) {
        return next(new Error('Tenant ID required'));
      }
      
      socket.tenantId = tenantId;
      next();
    });

    io.on('connection', (socket) => {
      const tenantId = socket.tenantId;
      
      socket.join(`tenant:${tenantId}`);
      
      socket.on('order:created', (data) => {
        socket.to(`tenant:${tenantId}`).emit('order:created', data);
      });

      socket.on('order:updated', (data) => {
        socket.to(`tenant:${tenantId}`).emit('order:updated', data);
      });

      socket.on('order:closed', (data) => {
        socket.to(`tenant:${tenantId}`).emit('order:closed', data);
      });

      socket.on('order:paid', (data) => {
        socket.to(`tenant:${tenantId}`).emit('order:paid', data);
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected');
      });
    });

    res.socket.server.io = io;
  }
  res.end();
};

export default SocketHandler;