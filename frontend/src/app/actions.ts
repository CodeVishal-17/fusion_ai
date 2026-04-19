"use server"
import { auth } from "@/auth"
import { prisma } from "@/auth"
import { revalidatePath } from "next/cache"

export async function deductToken() {
    const session = await auth();
    if (!session || !session.user || !session.user.id) return { success: false, error: "Not logged in" };
    
    const dbUser = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!dbUser || dbUser.tokens <= 0) return { success: false, error: "Insufficient tokens! Please purchase a top-up." };
    
    const updated = await prisma.user.update({
        where: { id: session.user.id },
        data: { tokens: dbUser.tokens - 1 }
    });
    
    return { success: true, remaining: updated.tokens };
}
