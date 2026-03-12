import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

interface ConnectedClient {
  socket: Socket;
  type: 'rider' | 'customer';
  userId: string;
}

@WebSocketGateway({ cors: true })
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{

  
  @WebSocketServer() server: Server;

  //store connected clients with their type (rider/customer) and id
  private connectClients = new Map<string, ConnectedClient>();

  //store active conversation (rider-customer pairs)
  private activeConversations = new Map<string, Set<string>>();

  afterInit(server: Server) {
    console.log('Websocket server initialized');
  }

  handleConnection(clients: Socket) {
    console.log(`client connected: ${clients.id} `);
  }

  handleDisconnect(client: any) {
    console.log(`Client Disconnected: ${client.id}`);
    //remove clients from connected clients and active conversations
    this.removeclient(client);
  }

  @SubscribeMessage('register')
  handleRegister(
    client: Socket,
    payload: { userId: string; type: 'rider' | 'customer' },
  ) {
    const { userId, type } = payload;
    this.connectClients.set(userId, { socket: client, type, userId });
    console.log(`Registered  ${type} with ID: ${userId}`);
    return { status: 'registered' };
  }

  private removeclient(client: Socket) {
    //find and remove from client

    for (const [userId, connectClients] of this.connectClients.entries()) {
      if (connectClients.socket.id === client.id) {
        this.connectClients.delete(userId);

        //remove from active conversations
        for (const [
          conversationId,
          participants,
        ] of this.activeConversations.entries()) {
          if (participants.has(userId)) {
            participants.delete(userId);
            if (participants.size === 0) {
              this.activeConversations.delete(conversationId);
            }
          }
        }
        break;
      }
    }
  }

  //public events (visible to all riders)
  emitToAllRiders(event: string, payload: any) {
    for (const client of this.connectClients.values()) {
      if (client.type === 'rider') {
        client.socket.emit(event, payload);
      }
    }
  }

  //private events (between specific rider and customer)
  emitToconversation(orderId: string, event: string, payload: any) {
    const participants = this.activeConversations.get(orderId);
    if (participants) {
      participants.forEach((userId) => {
        const client = this.connectClients.get(userId);
        if (client) {
          client.socket.emit(event, payload);
        }
      });
    }
  }

  //start private conversation between rider and customer
  startconversation(orderId: string, riderId: string, customerId: string) {
    const participants = new Set([riderId, customerId]);
    this.activeConversations.set(orderId, participants);
  }

  //public event handlers
  @SubscribeMessage('newOrder')
  handleNewOrder(
    client: Socket,
    payload: {
      orderId: string;
      pickup: string;
      dropoff: string;
      openning_bid: number;
    },
  ) {
    this.emitToAllRiders('newOrder', payload);
  }

  //private event handler
  @SubscribeMessage('startBidNegotiations')
  handleStartBidNegotiations(
    client: Socket,
    payload: {
      orderId: string;
      riderId: string;
      customerId: string;
    },
  ) {
    const { orderId, riderId, customerId } = payload;
    this.startconversation(orderId, riderId, customerId);
    this.emitToconversation(orderId, 'bidNegotiationsStarted', payload);
  }

  @SubscribeMessage('counterBid')
  handleCounterBid(
    client: Socket,
    payload: {
      orderId: string;
      bidAmount: number;
      message?: string;
    },
  ) {
    this.emitToconversation(payload.orderId, 'counterBidRecieved', payload);
  }

  //for rider only
  @SubscribeMessage('acceptInitialBid')
  handleIntialBidAccepted(
    client: Socket,
    payload: {
      orderId: string;
      bidstatus: boolean;
    },
  ) {
    this.emitToconversation(payload.orderId, 'initialBidAccepted', payload);
  }

  //for customer only
  @SubscribeMessage('acceptCounterBid')
  handlecounterBidAccepted(
    client: Socket,
    payload: {
      orderId: string;
      bidstatus: boolean;
    },
  ) {
    this.emitToconversation(payload.orderId, 'counterBidAccepted', payload);
  }

  //for rider only
  @SubscribeMessage('declineInitialBid')
  handleInitialBidDeclined(
    client: Socket,
    payload: {
      orderId: string;
      bidstatus: boolean;
    },
  ) {
    this.emitToconversation(payload.orderId, 'initialBidDeclined', payload);
  }

  //for rider only
  @SubscribeMessage('declineCounterBid')
  handleCounterBidDeclined(
    client: Socket,
    payload: {
      orderId: string;
      bidstatus: boolean;
    },
  ) {
    this.emitToconversation(payload.orderId, 'counterBidDeclined', payload);
  }

  @SubscribeMessage('milestoneReached')
  handleMilestoneReached(
    client: Socket,
    payload: {
      orderId: string;
      milestone: string;
      timestamp: number;
    },
  ) {
    this.emitToconversation(payload.orderId, 'milestoneReached', payload);
  }
}
