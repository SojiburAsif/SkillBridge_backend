import { Request, Response } from 'express';
import { catchAsync } from '../../shared/catchAsync';
import { sendResponse } from '../../shared/sendResponse';
import { MessageService } from './message.service';


const sendMessage = catchAsync(async (req: Request, res: Response) => {
  const result = await MessageService.sendMessage(req.user!.id, req.body.receiverId, req.body.text);
  sendResponse(res, {
    httpStatusCode: 201,
    success: true,
    message: 'Message sent successfully',
    data: result,
  });
});

const getConversation = catchAsync(async (req: Request, res: Response) => {
  const result = await MessageService.getConversation(req.user!.id, req.params.userId as string);
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: 'Conversation retrieved successfully',
    data: result,
  });
});

const getUnreadCount = catchAsync(async (req: Request, res: Response) => {
  const result = await MessageService.getUnreadCount(req.user!.id);
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: 'Unread count retrieved successfully',
    data: result,
  });
});

export const MessageController = {
  sendMessage,
  getConversation,
  getUnreadCount,
};
