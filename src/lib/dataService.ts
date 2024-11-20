import prisma from "@/lib/prisma";

export const getWatchlist = ()=> prisma.watchlist.findMany();