import prisma from "@/lib/prisma";

export const getWatchlist = ()=> prisma.watchlist.findMany();

export const getContactMessages = ()=> prisma.contactMessage.findMany();