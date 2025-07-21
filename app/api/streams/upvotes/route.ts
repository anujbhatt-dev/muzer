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
        
        await prismaClient.upvote.create({
            data:{
                userId:data.userId,
                streamId:data.streamId
            }
        })

        return NextResponse.json({
            message:"vote successful"
        })
    } catch (error) {
        return NextResponse.json({
            message:"error while upvoting"
        },{
            status:403
        })
    }
}