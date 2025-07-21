import { prismaClient } from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";


const UpvoteSchema = z.object({
    streamId:z.string(),
    userId:z.string()
})

export async function POST(request:NextRequest){
    try {
        const data = UpvoteSchema.parse(await request.json());
        await prismaClient.upvote.delete({
            where:{
                userId_streamId:{
                    userId:data.userId,
                    streamId:data.streamId
                }
            }
        })

        return NextResponse.json({
            message:"vote removed successfully"
        })

    } catch (error) {
        return NextResponse.json({
            message:"error while downvoting"
        },{
            status:403
        })
    }
}