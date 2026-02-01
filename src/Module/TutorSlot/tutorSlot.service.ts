// src/Module/Tutors/tutorSlot.service.ts
import { prisma } from "../../lib/prisma";
import { TutorSlot } from "../../../generated/prisma/client";

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
const updateSlot = async (slotId: string, data: Partial<Omit<TutorSlot, "id" | "tutorId" | "createdAt" | "updatedAt">>) => {
    const updated = await prisma.tutorSlot.update({
        where: { id: slotId },
        data
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
    return prisma.tutorSlot.findMany({ where: { tutorId } });
};

export const tutorSlotServices = {
    createSlots,
    updateSlot,
    deleteSlot,
    getSlotsByTutor
};
