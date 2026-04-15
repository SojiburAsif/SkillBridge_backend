// src/Module/Tutors/tutorSlot.service.ts
import { prisma } from "../../lib/prisma";
import { TutorSlot } from "../../../../generated/prisma/client";

type SlotInput = {
    date: string;
    startTime: string;
    endTime: string;
};

/**
 * createSlots
 * - Add multiple slots for a tutor
 */
const createSlots = async (tutorId: string, slots: SlotInput[]) => {
    if (!Array.isArray(slots) || slots.length === 0) return [];

    const slotsCreate = slots.map(s => ({
        tutorId,
        date: new Date(s.date),
        startTime: new Date(`${s.date}T${s.startTime}:00Z`),
        endTime: new Date(`${s.date}T${s.endTime}:00Z`),
    }));

    const result = await prisma.tutorSlot.createMany({
        data: slotsCreate,
        skipDuplicates: true
    });

    return result;
};

/**
 * updateSlot
 * - Update slot times or booked status
 */
const updateSlot = async (slotId: string, data: { date?: string, startTime?: string, endTime?: string, isBooked?: boolean }) => {
    const updateData: any = {};
    
    if (data.isBooked !== undefined) updateData.isBooked = data.isBooked;
    if (data.date) updateData.date = new Date(data.date);

    if (data.startTime || data.endTime) {
        const existing = await prisma.tutorSlot.findUnique({ where: { id: slotId } });
        if (!existing) throw new Error("Slot not found");

        const targetDateStr = data.date ? data.date : existing.date.toISOString().split('T')[0];

        if (data.startTime) updateData.startTime = new Date(`${targetDateStr}T${data.startTime}:00Z`);
        if (data.endTime) updateData.endTime = new Date(`${targetDateStr}T${data.endTime}:00Z`);
    }

    const updated = await prisma.tutorSlot.update({
        where: { id: slotId },
        data: updateData
    });
    return updated;
};

/**
 * deleteSlot
 */
const deleteSlot = async (slotId: string) => {
    const deleted = await prisma.tutorSlot.delete({ where: { id: slotId } });
    return deleted;
};

/**
 * getSlotsByTutor
 */
const getSlotsByTutor = async (tutorId: string) => {
    return prisma.tutorSlot.findMany({ 
        where: { tutorId },
        orderBy: [
            { date: 'asc' },
            { startTime: 'asc' }
        ]
     });
};

const getAllSlotsAdmin = async () => {
    return prisma.tutorSlot.findMany({
        include: {
            tutor: {
                include: {
                    user: {
                        select: { id: true, name: true, email: true, role: true }
                    },
                    category: { select: { id: true, name: true } }
                }
            }
        },
        orderBy: [{ date: "desc" }, { startTime: "desc" }]
    });
};

export const tutorSlotServices = {
    createSlots,
    updateSlot,
    deleteSlot,
    getSlotsByTutor,
    getAllSlotsAdmin
};
